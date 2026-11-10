// Course images are stored in the database as data URLs. Sending them inline in API responses
// makes course lists grow by megabytes per course and quickly hits Vercel's 4.5 MB response limit.
// Public responses therefore replace each data URL with a URL served by
// GET /api/courses/:id/images/:index, which returns the decoded image with long-lived caching.

// Only raster formats are served. SVG is excluded because it can carry scripts.
const SERVABLE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

const isDataUrl = (value) => typeof value === "string" && value.startsWith("data:");

// Returns { contentType, buffer } for a base64 image data URL, or null if it isn't one we serve.
const decodeDataUrl = (value) => {
    if (!isDataUrl(value)) return null;
    const comma = value.indexOf(",");
    if (comma === -1) return null;
    const match = /^data:([a-z/+.-]+);base64$/i.exec(value.slice(0, comma));
    if (!match) return null;
    const contentType = match[1].toLowerCase();
    if (!SERVABLE_TYPES.has(contentType)) return null;
    return { contentType, buffer: Buffer.from(value.slice(comma + 1), "base64") };
};

// The version changes whenever the course is saved, so the image URLs can be cached forever.
const imageUrl = (course, index) => {
    const version = course.updatedAt ? new Date(course.updatedAt).getTime() : 0;
    return `/api/courses/${course._id}/images/${index}?v=${version}`;
};

// Accepts a Mongoose document or a plain object and returns a plain object with image URLs.
const withImageUrls = (course) => {
    if (!course) return course;
    const plain = typeof course.toObject === "function" ? course.toObject() : { ...course };
    if (isDataUrl(plain.image)) {
        plain.image = imageUrl(plain, "cover");
    }
    if (Array.isArray(plain.images)) {
        plain.images = plain.images.map((src, index) => (isDataUrl(src) ? imageUrl(plain, index) : src));
    }
    return plain;
};

module.exports = { decodeDataUrl, withImageUrls };
