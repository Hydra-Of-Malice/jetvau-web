const mongoose = require("mongoose");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const isValidEmail = (value) => typeof value === "string" && EMAIL_REGEX.test(value.trim());

const isValidObjectId = (value) => typeof value === "string" && mongoose.isValidObjectId(value);

// Turns a Mongoose ValidationError / duplicate key error into a 400 response.
// Returns true when it handled the error.
const handleMongooseError = (error, res, duplicateMessage = "Record already exists") => {
    if (error && error.code === 11000) {
        res.status(400).json({ error: duplicateMessage });
        return true;
    }
    if (error && error.name === "ValidationError") {
        const message = Object.values(error.errors)
            .map((e) => e.message)
            .join(", ");
        res.status(400).json({ error: message || "Invalid data" });
        return true;
    }
    if (error && error.name === "CastError") {
        res.status(400).json({ error: "Invalid value" });
        return true;
    }
    return false;
};

module.exports = {
    isNonEmptyString,
    isValidEmail,
    isValidObjectId,
    handleMongooseError,
};
