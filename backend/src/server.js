require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const enquiryRoutes = require("./routes/enquiries");
const paymentRoutes = require("./routes/payments");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
    cors({
        origin: [
            process.env.FRONTEND_URL || "http://localhost:3000",
            process.env.ADMIN_URL || "http://localhost:5173",
        ],
        credentials: true,
    })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
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
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
    console.log(`🚀 JetVau Backend running on http://localhost:${PORT}`);
});
