const express = require("express");
const Course = require("../models/Course");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");
const { isValidObjectId, handleMongooseError } = require("../utils/validation");

const router = express.Router();

// Fields an admin may set. Anything else in the request body (slug, _id, timestamps) is ignored.
const EDITABLE_FIELDS = [
    "title",
    "category",
    "duration",
    "price",
    "displayPrice",
    "originalPrice",
    "image",
    "images",
    "description",
    "features",
    "syllabus",
    "isActive",
];

const pickCourseFields = (body = {}) => {
    const data = {};
    for (const field of EDITABLE_FIELDS) {
        if (body[field] !== undefined) data[field] = body[field];
    }
    return data;
};

// Course lists don't need the full image gallery, which can be large
const LIST_PROJECTION = "-images";

// GET /api/courses — Public: list active courses
router.get("/", async (req, res) => {
    try {
        const courses = await Course.find({ isActive: true })
            .select(LIST_PROJECTION)
            .sort({ createdAt: -1 });
        res.json({ success: true, courses });
    } catch (error) {
        console.error("Get courses error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/courses/admin/all — Admin: list every course, including inactive ones
router.get("/admin/all", auth, adminOnly, async (req, res) => {
    try {
        const courses = await Course.find().select(LIST_PROJECTION).sort({ createdAt: -1 });
        res.json({ success: true, courses });
    } catch (error) {
        console.error("Admin get courses error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/courses/admin/:id — Admin: get one course by id, including inactive ones
router.get("/admin/:id", auth, adminOnly, async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(404).json({ error: "Course not found" });
        }
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        res.json({ success: true, course });
    } catch (error) {
        console.error("Admin get course error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/courses/:slug — Public: get course by slug
router.get("/:slug", async (req, res) => {
    try {
        const course = await Course.findOne({ slug: String(req.params.slug), isActive: true });
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
        const data = pickCourseFields(req.body);
        const { title, category, duration, price, displayPrice, description } = data;

        if (!title || !category || !duration || price === undefined || !displayPrice || !description) {
            return res.status(400).json({
                error: "Required fields: title, category, duration, price, displayPrice, description",
            });
        }

        const course = await Course.create(data);
        res.status(201).json({ success: true, course });
    } catch (error) {
        if (handleMongooseError(error, res, "A course with this title already exists")) return;
        console.error("Create course error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// PUT /api/courses/:id — Admin: update course
router.put("/:id", auth, adminOnly, async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(404).json({ error: "Course not found" });
        }

        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        // Use save() so validators and the slug hook run when the title changes
        course.set(pickCourseFields(req.body));
        await course.save();

        res.json({ success: true, course });
    } catch (error) {
        if (handleMongooseError(error, res, "A course with this title already exists")) return;
        console.error("Update course error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE /api/courses/:id — Admin: deactivate course.
// Courses are hidden instead of deleted so existing enrollments and payment records keep their course.
router.delete("/:id", auth, adminOnly, async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(404).json({ error: "Course not found" });
        }

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        res.json({ success: true, message: "Course deactivated" });
    } catch (error) {
        console.error("Delete course error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
