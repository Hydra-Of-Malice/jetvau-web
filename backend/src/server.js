require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const { MongoRateLimitStore } = require("./utils/rateLimitStore");

// Fail fast when required configuration is missing, instead of failing on the first request.
const REQUIRED_ENV = ["MONGODB_URI", "JWT_SECRET"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnv.join(", ")}`);
}

// Route imports
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const enquiryRoutes = require("./routes/enquiries");
const paymentRoutes = require("./routes/payments");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

// Behind Vercel / other proxies, so req.ip is the client IP (needed for rate limiting)
app.set("trust proxy", 1);
app.disable("x-powered-by");

// FRONTEND_URL and ADMIN_URL may each be a comma-separated list (e.g. production + preview domains)
const allowedOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_URL]
    .filter(Boolean)
    .flatMap((value) => value.split(","))
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
if (allowedOrigins.length === 0) {
    allowedOrigins.push("http://localhost:3000", "http://localhost:5173");
}

app.use(helmet());
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);
// Vercel Functions reject request bodies over 4.5 MB, so keep the limit below that.
app.use(
    express.json({
        limit: "4mb",
        // The Razorpay webhook signature is computed over the raw request body
        verify: (req, res, buf) => {
            if (req.originalUrl.startsWith("/api/payments/webhook")) req.rawBody = buf;
        },
    })
);
app.use(express.urlencoded({ limit: "4mb", extended: true }));

// Rate limits for endpoints that are attractive to brute force or spam.
// Counters live in MongoDB so they are shared by all serverless instances. If the store fails,
// the request is let through rather than locking everyone out.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    store: new MongoRateLimitStore("auth"),
    passOnStoreError: true,
    message: { error: "Too many attempts. Please try again in 15 minutes." },
});
const enquiryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    store: new MongoRateLimitStore("enquiry"),
    passOnStoreError: true,
    message: { error: "Too many enquiries. Please try again later." },
});

// Health check (does not need the database)
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Make sure the database is connected before any route runs.
// On serverless platforms the connection is created lazily and reused between invocations.
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection error:", error.message);
        res.status(503).json({ error: "Service temporarily unavailable" });
    }
});

// Routes (the limiters run after the database middleware because their store uses MongoDB)
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/admin/login", authLimiter);
app.post("/api/enquiries", enquiryLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err.type === "entity.too.large") {
        return res.status(413).json({ error: "Request is too large. Use smaller images." });
    }
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "Invalid JSON body" });
    }
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// Start a server only when run directly (`npm start` / `npm run dev`).
// On Vercel the exported app is used as the function handler.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`JetVau backend running on http://localhost:${PORT}`);
    });
}

module.exports = app;
