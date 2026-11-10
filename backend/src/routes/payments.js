const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const auth = require("../middleware/auth");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const { sendEnrollmentConfirmation } = require("../utils/email");
const { isNonEmptyString, isValidObjectId } = require("../utils/validation");
const { withImageUrls } = require("../utils/courseImages");

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

// Captures the payment if it is only authorized. Payments that are never captured are
// refunded by Razorpay automatically, so an enrollment must only be confirmed once captured.
// Returns the captured payment, or null if it doesn't belong to the order or wasn't completed.
const capturePayment = async (paymentId, orderId) => {
    const razorpay = getRazorpayInstance();
    let payment = await razorpay.payments.fetch(paymentId);
    if (!payment || payment.order_id !== orderId) return null;

    if (payment.status === "authorized") {
        try {
            payment = await razorpay.payments.capture(paymentId, payment.amount, payment.currency);
        } catch (error) {
            // It may have been captured automatically in the meantime, so check again
            console.error("Capture payment error:", error?.error?.description || error.message);
            payment = await razorpay.payments.fetch(paymentId);
        }
    }

    return payment.status === "captured" ? payment : null;
};

// Marks the enrollment paid exactly once, even if /verify and the webhook (or two /verify calls)
// run at the same time. Returns { enrollment, newlyPaid }; enrollment is null if none exists.
const markEnrollmentPaid = async ({ userId, courseId, orderId, paymentId, amount }) => {
    const updated = await Enrollment.findOneAndUpdate(
        // trusted(): sanitizeFilter would otherwise turn $ne into a literal value
        { user: userId, course: courseId, status: mongoose.trusted({ $ne: "PAID" }) },
        {
            $set: {
                razorpayOrderId: orderId,
                razorpayPaymentId: paymentId,
                amount,
                status: "PAID",
                paidAt: new Date(),
            },
        },
        { new: true }
    ).populate("course", "title");

    if (updated) return { enrollment: updated, newlyPaid: true };

    const existing = await Enrollment.findOne({ user: userId, course: courseId }).populate("course", "title");
    if (existing && existing.razorpayPaymentId && existing.razorpayPaymentId !== paymentId) {
        // The user paid two different orders for the same course; the second needs a manual refund
        console.warn(
            `Duplicate payment ${paymentId} for enrollment ${existing._id} (already paid with ${existing.razorpayPaymentId}). Refund it from the Razorpay dashboard.`
        );
    }
    return { enrollment: existing, newlyPaid: false };
};

// Shared by /verify and the webhook: checks the order and payment with Razorpay, captures the
// payment if needed and confirms the enrollment. The order's notes are set by our server in
// /create-order, so they say which user and course were paid for.
// Returns { status, error } on failure or { enrollment } on success.
const confirmPayment = async ({ orderId, paymentId, expectedUserId }) => {
    const order = await getRazorpayInstance().orders.fetch(orderId);
    const orderUserId = order?.notes?.userId;
    const orderCourseId = order?.notes?.courseId;

    if (!isValidObjectId(orderUserId) || !isValidObjectId(orderCourseId)) {
        return { status: 400, error: "Unknown order" };
    }
    if (expectedUserId && orderUserId !== expectedUserId) {
        return { status: 403, error: "This payment does not belong to your account" };
    }

    const payment = await capturePayment(paymentId, orderId);
    if (!payment) {
        return {
            status: 400,
            error: "Payment was not completed. If money was deducted, it will be refunded automatically.",
        };
    }

    const { enrollment, newlyPaid } = await markEnrollmentPaid({
        userId: orderUserId,
        courseId: orderCourseId,
        orderId,
        paymentId,
        amount: payment.amount,
    });

    if (!enrollment) {
        console.error(`Captured payment ${paymentId} for order ${orderId} has no enrollment`);
        return { status: 404, error: "Enrollment not found" };
    }

    if (newlyPaid) {
        // Awaited because serverless functions can be frozen right after the response is sent.
        // It never throws; failures are only logged.
        const user = await User.findById(orderUserId);
        if (user) {
            await sendEnrollmentConfirmation(
                user.email,
                user.name,
                enrollment.course?.title || "your course",
                enrollment.amount
            );
        }
    }

    return { enrollment };
};

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

        const result = await confirmPayment({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            expectedUserId: req.user._id.toString(),
        });
        if (result.error) {
            return res.status(result.status).json({ error: result.error });
        }

        const { enrollment } = result;
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

// Webhook events that carry a payment for one of our orders
const PAYMENT_EVENTS = new Set(["payment.authorized", "payment.captured", "order.paid"]);

// POST /api/payments/webhook — Razorpay: confirms enrollments even when the browser closed
// before /verify ran. Set it up in the Razorpay dashboard with RAZORPAY_WEBHOOK_SECRET.
router.post("/webhook", async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!isRazorpayConfigured() || !webhookSecret) {
            return res.status(503).json({ error: "Webhook is not configured" });
        }

        const signature = req.headers["x-razorpay-signature"];
        if (typeof signature !== "string" || !Buffer.isBuffer(req.rawBody)) {
            return res.status(400).json({ error: "Invalid webhook" });
        }

        // The signature covers the exact bytes Razorpay sent, not the re-serialized JSON
        const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(req.rawBody).digest("hex");
        if (!signaturesMatch(expectedSignature, signature)) {
            return res.status(400).json({ error: "Invalid signature" });
        }

        const event = req.body?.event;
        const payment = req.body?.payload?.payment?.entity;
        if (!PAYMENT_EVENTS.has(event) || !payment?.id || !payment?.order_id) {
            // Acknowledge events we don't use so Razorpay doesn't retry them
            return res.json({ success: true, ignored: true });
        }

        const result = await confirmPayment({ orderId: payment.order_id, paymentId: payment.id });
        if (result.error) {
            // Not retryable (unknown order, failed payment), so acknowledge it
            console.warn(`Webhook ${event} for ${payment.id} not applied: ${result.error}`);
            return res.json({ success: true, applied: false });
        }

        res.json({ success: true, applied: true });
    } catch (error) {
        // A 5xx makes Razorpay retry later, e.g. after a temporary database or API error
        console.error("Payment webhook error:", error);
        res.status(500).json({ error: "Webhook processing failed" });
    }
});

// GET /api/payments/my-enrollments — User: get their enrollments
router.get("/my-enrollments", auth, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ user: req.user._id })
            .populate("course", "title slug category duration displayPrice image updatedAt")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            enrollments: enrollments.map((enrollment) => {
                const plain = enrollment.toObject();
                plain.course = withImageUrls(plain.course);
                return plain;
            }),
        });
    } catch (error) {
        console.error("Get enrollments error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
