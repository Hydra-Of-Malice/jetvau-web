const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const auth = require("../middleware/auth");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { sendEnrollmentConfirmation } = require("../utils/email");
const { isNonEmptyString, isValidObjectId } = require("../utils/validation");

const router = express.Router();

const isRazorpayConfigured = () =>
    Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

let razorpayInstance = null;
const getRazorpayInstance = () => {
    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
};

// Constant-time comparison so the signature can't be guessed byte by byte
const signaturesMatch = (expected, received) => {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(received, "utf8");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// POST /api/payments/create-order — User: create Razorpay order
router.post("/create-order", auth, async (req, res) => {
    try {
        if (!isRazorpayConfigured()) {
            return res.status(503).json({ error: "Payments are not configured" });
        }

        const { courseId } = req.body || {};

        if (!isValidObjectId(courseId)) {
            return res.status(400).json({ error: "A valid courseId is required" });
        }

        const course = await Course.findById(courseId);
        if (!course || !course.isActive) {
            return res.status(404).json({ error: "Course not found" });
        }

        const existingEnrollment = await Enrollment.findOne({
            user: req.user._id,
            course: course._id,
            status: "PAID",
        });
        if (existingEnrollment) {
            return res.status(400).json({ error: "You are already enrolled in this course" });
        }

        const order = await getRazorpayInstance().orders.create({
            amount: course.price, // in paise
            currency: "INR",
            receipt: `enr_${req.user._id.toString().slice(-8)}_${course._id.toString().slice(-8)}_${Date.now().toString(36)}`,
            notes: {
                userId: req.user._id.toString(),
                courseId: course._id.toString(),
                courseName: course.title,
            },
        });

        // Create or update the pending enrollment record
        await Enrollment.findOneAndUpdate(
            { user: req.user._id, course: course._id },
            {
                user: req.user._id,
                course: course._id,
                razorpayOrderId: order.id,
                amount: course.price,
                status: "PENDING",
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
            },
            key: process.env.RAZORPAY_KEY_ID,
            course: {
                title: course.title,
                displayPrice: course.displayPrice,
            },
        });
    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({ error: "Failed to create payment order" });
    }
});

// POST /api/payments/verify — User: verify payment and confirm enrollment
router.post("/verify", auth, async (req, res) => {
    try {
        if (!isRazorpayConfigured()) {
            return res.status(503).json({ error: "Payments are not configured" });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

        if (
            !isNonEmptyString(razorpay_order_id) ||
            !isNonEmptyString(razorpay_payment_id) ||
            !isNonEmptyString(razorpay_signature)
        ) {
            return res.status(400).json({ error: "Missing payment verification data" });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (!signaturesMatch(expectedSignature, razorpay_signature)) {
            return res.status(400).json({ error: "Payment verification failed" });
        }

        // The order's notes are set by our server, so they say which user and course were paid for.
        // Checking them stops one user from confirming an enrollment with another user's payment,
        // and still finds the enrollment if the user opened checkout twice and paid the older order.
        const order = await getRazorpayInstance().orders.fetch(razorpay_order_id);
        const orderUserId = order?.notes?.userId;
        const orderCourseId = order?.notes?.courseId;

        if (orderUserId !== req.user._id.toString() || !isValidObjectId(orderCourseId)) {
            return res.status(403).json({ error: "This payment does not belong to your account" });
        }

        const enrollment = await Enrollment.findOne({
            user: req.user._id,
            course: orderCourseId,
        }).populate("course");

        if (!enrollment) {
            return res.status(404).json({ error: "Enrollment not found" });
        }

        const alreadyPaid = enrollment.status === "PAID";

        if (!alreadyPaid) {
            enrollment.razorpayOrderId = razorpay_order_id;
            enrollment.razorpayPaymentId = razorpay_payment_id;
            enrollment.amount = order.amount;
            enrollment.status = "PAID";
            enrollment.paidAt = new Date();
            await enrollment.save();

            // Send the confirmation email once. It is awaited because serverless functions can be
            // frozen right after the response is sent. It never throws; failures are only logged.
            await sendEnrollmentConfirmation(
                req.user.email,
                req.user.name,
                enrollment.course?.title || "your course",
                enrollment.amount
            );
        }

        res.json({
            success: true,
            enrollment: {
                id: enrollment._id,
                course: enrollment.course?.title,
                status: enrollment.status,
                paidAt: enrollment.paidAt,
            },
        });
    } catch (error) {
        console.error("Verify payment error:", error);
        res.status(500).json({ error: "Payment verification failed" });
    }
});

// GET /api/payments/my-enrollments — User: get their enrollments
router.get("/my-enrollments", auth, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ user: req.user._id })
            .populate("course", "title slug category duration displayPrice image")
            .sort({ createdAt: -1 });

        res.json({ success: true, enrollments });
    } catch (error) {
        console.error("Get enrollments error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
