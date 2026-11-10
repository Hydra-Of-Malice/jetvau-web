const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        razorpayOrderId: {
            type: String,
            required: true,
        },
        razorpayPaymentId: {
            type: String,
            default: null,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["PENDING", "PAID", "FAILED"],
            default: "PENDING",
        },
        paidAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate enrollments (one user per course)
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
