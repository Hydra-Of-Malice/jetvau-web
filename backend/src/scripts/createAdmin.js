// Creates (or promotes) an admin account.
//
// Usage:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-password' npm run create-admin
//
// Optional: ADMIN_NAME, ADMIN_PHONE. Reads MONGODB_URI from backend/.env.
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function main() {
    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "";
    const name = process.env.ADMIN_NAME || "Admin";
    const phone = process.env.ADMIN_PHONE || "0000000000";

    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not set");
    }
    if (!email || !password) {
        throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD");
    }
    if (password.length < 12) {
        throw new Error("ADMIN_PASSWORD must be at least 12 characters");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const existing = await User.findOne({ email }).select("+password");
    if (existing) {
        existing.role = "admin";
        existing.password = password;
        await existing.save();
        console.log(`Updated ${email}: role set to admin and password changed.`);
    } else {
        await User.create({ name, email, phone, password, role: "admin" });
        console.log(`Created admin account ${email}.`);
    }

    await mongoose.disconnect();
}

main().catch(async (error) => {
    console.error(error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
