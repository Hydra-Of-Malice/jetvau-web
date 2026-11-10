const express = require("express");
const User = require("../models/User");
const Course = require("../models/Course");
const Enquiry = require("../models/Enquiry");
const Enrollment = require("../models/Enrollment");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");
const { isNonEmptyString } = require("../utils/validation");
const { signToken, publicUser } = require("../utils/tokens");

const router = express.Router();

// POST /api/admin/login — Admin login (same as auth login but checks role)
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!isNonEmptyString(email) || typeof password !== "string" || password.length === 0) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
            role: "admin",
        }).select("+password");

        if (!user) {
            return res.status(401).json({ error: "Invalid admin credentials" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid admin credentials" });
        }

        res.json({
            success: true,
            token: signToken(user._id, "24h"),
            user: publicUser(user),
        });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/admin/stats — Dashboard stats
router.get("/stats", auth, adminOnly, async (req, res) => {
    try {
        const [
            totalUsers,
            totalCourses,
            totalEnquiries,
            totalEnrollments,
            paidEnrollments,
            recentEnquiries,
            revenueResult,
        ] = await Promise.all([
            User.countDocuments({ role: "user" }),
            Course.countDocuments({ isActive: true }),
            Enquiry.countDocuments(),
            Enrollment.countDocuments(),
            Enrollment.countDocuments({ status: "PAID" }),
            Enquiry.find().sort({ createdAt: -1 }).limit(5),
            Enrollment.aggregate([
                { $match: { status: "PAID" } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalCourses,
                totalEnquiries,
                totalEnrollments,
                paidEnrollments,
                totalRevenue, // in paise
                recentEnquiries,
            },
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/admin/enrollments — All enrollments with user + course data
router.get("/enrollments", auth, adminOnly, async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate("user", "name email phone")
            .populate("course", "title slug displayPrice")
            .sort({ createdAt: -1 });

        res.json({ success: true, enrollments });
    } catch (error) {
        console.error("Admin enrollments error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// The first admin account is created from the command line with `npm run create-admin`
// (see src/scripts/createAdmin.js). There is intentionally no public endpoint for it.

module.exports = router;
