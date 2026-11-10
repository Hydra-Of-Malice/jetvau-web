const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const auth = require("../middleware/auth");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { sendEnrollmentConfirmation } = require("../utils/email");

const router = express.Router();

const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

// POST /api/payments/create-order — User: create Razorpay order
router.post("/create-order", auth, async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ error: "courseId is required" });
        }

        const course = await Course.findById(courseId);
        if (!course || !course.isActive) {
            return res.status(404).json({ error: "Course not found" });
        }

        // Check if user already enrolled and paid
        const existingEnrollment = await Enrollment.findOne({
            user: req.user._id,
            course: course._id,
            status: "PAID",
        });
        if (existingEnrollment) {
            return res.status(400).json({ error: "You are already enrolled in this course" });
        }

        const razorpay = getRazorpayInstance();

        const order = await razorpay.orders.create({
            amount: course.price, // in paise
            currency: "INR",
            receipt: `enr_${req.user._id.toString().slice(-8)}_${course._id.toString().slice(-8)}_${Date.now().toString(36)}`,
            notes: {
                userId: req.user._id.toString(),
                courseId: course._id.toString(),
                courseName: course.title,
            },
        });

        // Create or update enrollment record
        await Enrollment.findOneAndUpdate(
            { user: req.user._id, course: course._id },
            {
                user: req.user._id,
                course: course._id,
                razorpayOrderId: order.id,
                amount: course.price,
                status: "PENDING",
            },
            { upsert: true, new: true }
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
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: "Missing payment verification data" });
        }

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: "Payment verification failed" });
        }

        // Update enrollment
        const enrollment = await Enrollment.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            {
                razorpayPaymentId: razorpay_payment_id,
                status: "PAID",
                paidAt: new Date(),
            },
            { new: true }
        ).populate("course");

        if (!enrollment) {
            return res.status(404).json({ error: "Enrollment not found" });
        }

        // Send confirmation email (don't fail if email fails)
        sendEnrollmentConfirmation(
            req.user.email,
            req.user.name,
            enrollment.course.title,
            enrollment.amount
        );

        res.json({
            success: true,
            enrollment: {
                id: enrollment._id,
                course: enrollment.course.title,
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
