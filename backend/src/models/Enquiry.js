const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [100, "Name is too long"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
            maxlength: [254, "Email is too long"],
        },
        phone: {
            type: String,
            required: [true, "Phone is required"],
            trim: true,
            maxlength: [20, "Phone is too long"],
        },
        course: {
            type: String,
            required: [true, "Course selection is required"],
            maxlength: [200, "Course name is too long"],
        },
        message: {
            type: String,
            default: "",
            maxlength: [2000, "Message is too long"],
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
