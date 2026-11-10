const express = require("express");
const Enquiry = require("../models/Enquiry");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");

const router = express.Router();

// POST /api/enquiries — Public: submit enquiry
router.post("/", async (req, res) => {
    try {
        const { name, email, phone, course, message } = req.body;

        if (!name || !email || !phone || !course) {
            return res.status(400).json({ error: "Name, email, phone, and course are required" });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email address" });
        }

        const enquiry = await Enquiry.create({
            name,
            email,
            phone,
            course,
            message: message || "",
        });

        res.status(201).json({ success: true, id: enquiry._id });
    } catch (error) {
        console.error("Create enquiry error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/enquiries — Admin: list all enquiries
router.get("/", auth, adminOnly, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, enquiries });
    } catch (error) {
        console.error("Get enquiries error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// PATCH /api/enquiries/:id — Admin: update status
router.patch("/:id", auth, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !["NEW", "CONTACTED", "CLOSED"].includes(status)) {
            return res.status(400).json({ error: "Valid status required: NEW, CONTACTED, CLOSED" });
        }

        const enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!enquiry) {
            return res.status(404).json({ error: "Enquiry not found" });
        }

        res.json({ success: true, enquiry });
    } catch (error) {
        console.error("Update enquiry error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
