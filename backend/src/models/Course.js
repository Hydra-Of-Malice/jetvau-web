const mongoose = require("mongoose");

const syllabusItemSchema = new mongoose.Schema(
    {
        day: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
    },
    { _id: false }
);

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Course title is required"],
            trim: true,
            maxlength: [200, "Title is too long"],
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
        category: {
            type: String,
            enum: ["Certification", "Specialization"],
            required: true,
        },
        duration: {
            type: String,
            required: [true, "Duration is required"],
        },
        price: {
            type: Number,
            required: [true, "Price is required (in paise)"],
            min: [100, "Price must be at least ₹1"],
            validate: {
                validator: Number.isInteger,
                message: "Price must be a whole number of paise",
            },
        },
        displayPrice: {
            type: String,
            required: [true, "Display price is required"],
        },
        originalPrice: {
            type: String,
            default: "",
        },
        image: {
            type: String,
            default: "",
        },
        images: [{
            type: String,
        }],
        description: {
            type: String,
            required: [true, "Description is required"],
            maxlength: [5000, "Description is too long"],
        },
        features: [{ type: String }],
        syllabus: [syllabusItemSchema],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-generate slug from title before saving
courseSchema.pre("save", function (next) {
    if (this.isModified("title")) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        if (!this.slug) {
            this.invalidate("title", "Title must contain letters or numbers");
        }
    }
    next();
});

module.exports = mongoose.model("Course", courseSchema);
