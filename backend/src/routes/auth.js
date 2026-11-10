const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { isNonEmptyString, isValidEmail, handleMongooseError } = require("../utils/validation");
const { signToken, publicUser } = require("../utils/tokens");

const router = express.Router();

const PHONE_REGEX = /^\d{10}$/;

// POST /api/auth/register
router.post("/register", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body || {};

        if (
            !isNonEmptyString(name) ||
            !isNonEmptyString(email) ||
            !isNonEmptyString(phone) ||
            typeof password !== "string" ||
            password.length === 0
        ) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email address" });
        }

        if (!PHONE_REGEX.test(phone.trim())) {
            return res.status(400).json({ error: "Phone number must be 10 digits" });
        }

        if (password.length < 8 || password.length > 128) {
            return res.status(400).json({ error: "Password must be between 8 and 128 characters" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Role is never taken from the request body
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            password,
        });

        res.status(201).json({
            success: true,
            token: signToken(user._id, "7d"),
            user: publicUser(user),
        });
    } catch (error) {
        if (handleMongooseError(error, res, "Email already registered")) return;
        console.error("Register error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!isNonEmptyString(email) || typeof password !== "string" || password.length === 0) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        res.json({
            success: true,
            token: signToken(user._id, "7d"),
            user: publicUser(user),
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/auth/me
router.get("/me", auth, async (req, res) => {
    res.json({ success: true, user: publicUser(req.user) });
});

// PUT /api/auth/me — Update profile
router.put("/me", auth, async (req, res) => {
    try {
        const { name, phone } = req.body || {};
        const updates = {};

        if (name !== undefined) {
            if (!isNonEmptyString(name)) {
                return res.status(400).json({ error: "Name cannot be empty" });
            }
            updates.name = name.trim();
        }

        if (phone !== undefined) {
            if (typeof phone !== "string" || !PHONE_REGEX.test(phone.trim())) {
                return res.status(400).json({ error: "Phone number must be 10 digits" });
            }
            updates.phone = phone.trim();
        }

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true,
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ success: true, user: publicUser(user) });
    } catch (error) {
        if (handleMongooseError(error, res)) return;
        console.error("Update profile error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
