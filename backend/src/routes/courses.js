const express = require("express");
const Course = require("../models/Course");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");

const router = express.Router();

// GET /api/courses — Public: list active courses
router.get("/", async (req, res) => {
    try {
        const courses = await Course.find({ isActive: true }).sort({ createdAt: -1 });
        res.json({ success: true, courses });
    } catch (error) {
        console.error("Get courses error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/courses/:slug — Public: get course by slug
router.get("/:slug", async (req, res) => {
    try {
        const course = await Course.findOne({ slug: req.params.slug, isActive: true });
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        res.json({ success: true, course });
    } catch (error) {
        console.error("Get course error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/courses — Admin: create course
router.post("/", auth, adminOnly, async (req, res) => {
    try {
        const { title, category, duration, price, displayPrice, originalPrice, image, images, description, features, syllabus } = req.body;

        if (!title || !category || !duration || !price || !displayPrice || !description) {
            return res.status(400).json({ error: "Required fields: title, category, duration, price, displayPrice, description" });
        }

        const course = await Course.create({
            title,
            category,
            duration,
            price,
            displayPrice,
            originalPrice: originalPrice || "",
            image: image || "",
            images: images || [],
            description,
            features: features || [],
            syllabus: syllabus || [],
        });

        res.status(201).json({ success: true, course });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "A course with this title already exists" });
        }
        console.error("Create course error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// PUT /api/courses/:id — Admin: update course
router.put("/:id", auth, adminOnly, async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        res.json({ success: true, course });
    } catch (error) {
        console.error("Update course error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE /api/courses/:id — Admin: delete course permanently
router.delete("/:id", auth, adminOnly, async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);

        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        res.json({ success: true, message: "Course deleted" });
    } catch (error) {
        console.error("Delete course error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
