const mongoose = require("mongoose");

// Turn query filters like { email: { $gt: "" } } coming from user input into plain equality checks.
mongoose.set("sanitizeFilter", true);
mongoose.set("strictQuery", true);

// Reuse one connection across requests and across warm serverless invocations.
let connectionPromise = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!connectionPromise) {
        connectionPromise = mongoose
            .connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 10000,
            })
            .then((conn) => {
                console.log(`MongoDB connected: ${conn.connection.host}`);
                return conn.connection;
            })
            .catch((error) => {
                // Allow the next request to retry instead of caching the failure forever
                connectionPromise = null;
                throw error;
            });
    }

    return connectionPromise;
};

module.exports = connectDB;
