const mongoose = require("mongoose");

// express-rate-limit keeps its counters in memory by default. On Vercel every function instance
// has its own memory, so an attacker spread across instances would get the limit many times over.
// This store keeps the counters in MongoDB so all instances share them. Fixed windows are used:
// one document per client per window, removed automatically by a TTL index once the window ends.

const rateLimitHitSchema = new mongoose.Schema(
    {
        _id: { type: String },
        hits: { type: Number, default: 0 },
        expiresAt: { type: Date, required: true },
    },
    { versionKey: false }
);
rateLimitHitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RateLimitHit =
    mongoose.models.RateLimitHit || mongoose.model("RateLimitHit", rateLimitHitSchema, "ratelimithits");

class MongoRateLimitStore {
    constructor(prefix) {
        this.prefix = prefix;
        // Tells express-rate-limit that counters are shared, not per-instance
        this.localKeys = false;
    }

    init(options) {
        this.windowMs = options.windowMs;
    }

    window(key) {
        const start = Math.floor(Date.now() / this.windowMs) * this.windowMs;
        return { id: `${this.prefix}:${key}:${start}`, resetTime: new Date(start + this.windowMs) };
    }

    async increment(key) {
        const { id, resetTime } = this.window(key);
        const update = { $inc: { hits: 1 }, $setOnInsert: { expiresAt: resetTime } };
        let doc;
        try {
            doc = await RateLimitHit.findOneAndUpdate({ _id: id }, update, { upsert: true, new: true });
        } catch (error) {
            // Two concurrent upserts of a new key: one wins, the other retries as a plain update
            if (error.code !== 11000) throw error;
            doc = await RateLimitHit.findOneAndUpdate({ _id: id }, update, { upsert: true, new: true });
        }
        return { totalHits: doc.hits, resetTime };
    }

    async decrement(key) {
        await RateLimitHit.updateOne({ _id: this.window(key).id }, { $inc: { hits: -1 } });
    }

    async resetKey(key) {
        await RateLimitHit.deleteOne({ _id: this.window(key).id });
    }
}

module.exports = { MongoRateLimitStore };
