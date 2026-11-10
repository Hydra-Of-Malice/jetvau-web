const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const user = await User.create({ name, email, phone, password });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select(
            "+password"
        );
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/auth/me
router.get("/me", auth, async (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
            role: req.user.role,
        },
    });
});

// PUT /api/auth/me — Update profile
router.put("/me", auth, async (req, res) => {
    try {
        const { name, phone } = req.body;
        const updates = {};
        if (name && name.trim()) updates.name = name.trim();
        if (phone && phone.trim()) updates.phone = phone.trim();

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
