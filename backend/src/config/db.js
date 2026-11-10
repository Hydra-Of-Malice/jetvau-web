const dns = require("dns");
const mongoose = require("mongoose");

// Optional, for local development: mongodb+srv:// needs a DNS SRV lookup, which fails with
// "querySrv ECONNREFUSED" when Node picks up a local DNS server that refuses queries.
// Set DNS_SERVERS=8.8.8.8,1.1.1.1 (or your router's address) to use those servers instead.
if (process.env.DNS_SERVERS) {
    dns.setServers(process.env.DNS_SERVERS.split(",").map((server) => server.trim()).filter(Boolean));
}

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
