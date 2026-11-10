const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: [true, "Phone is required"],
            trim: true,
        },
        course: {
            type: String,
            required: [true, "Course selection is required"],
        },
        message: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["NEW", "CONTACTED", "CLOSED"],
            default: "NEW",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Enquiry", enquirySchema);
