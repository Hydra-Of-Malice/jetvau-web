const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Course = require("../models/Course");
const Enquiry = require("../models/Enquiry");
const Enrollment = require("../models/Enrollment");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");

const router = express.Router();

// POST /api/admin/login — Admin login (same as auth login but checks role)
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            role: "admin",
        }).select("+password");

        if (!user) {
            return res.status(401).json({ error: "Invalid admin credentials" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid admin credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "24h",
        });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/admin/stats — Dashboard stats
router.get("/stats", auth, adminOnly, async (req, res) => {
    try {
        const [totalUsers, totalCourses, totalEnquiries, totalEnrollments, paidEnrollments, recentEnquiries] =
            await Promise.all([
                User.countDocuments({ role: "user" }),
                Course.countDocuments({ isActive: true }),
                Enquiry.countDocuments(),
                Enrollment.countDocuments(),
                Enrollment.countDocuments({ status: "PAID" }),
                Enquiry.find().sort({ createdAt: -1 }).limit(5),
            ]);

        // Calculate total revenue
        const revenueResult = await Enrollment.aggregate([
            { $match: { status: "PAID" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
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

// POST /api/admin/seed — Create initial admin user (run once)
router.post("/seed", async (req, res) => {
    try {
        const existingAdmin = await User.findOne({ role: "admin" });
        if (existingAdmin) {
            return res.status(400).json({ error: "Admin already exists" });
        }

        const admin = await User.create({
            name: "Admin",
            email: "admin@jetvau.com",
            phone: "9876543210",
            password: "admin123",
            role: "admin",
        });

        res.status(201).json({
            success: true,
            message: "Admin user created",
            credentials: {
                email: "admin@jetvau.com",
                password: "admin123",
                note: "Change this password immediately!",
            },
        });
    } catch (error) {
        console.error("Seed error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
