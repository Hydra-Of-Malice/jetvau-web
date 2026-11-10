import type { MetadataRoute } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://jetvau.com";

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
        { url: `${baseUrl}/courses`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
        { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
        { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
        { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
        { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ];

    // Fetch courses from API for dynamic routes
    let courseRoutes: MetadataRoute.Sitemap = [];
    try {
        const res = await fetch(`${API_BASE}/courses`, { cache: "no-store" });
        const data = await res.json();
        courseRoutes = (data.courses || []).map((course: { slug: string }) => ({
            url: `${baseUrl}/courses/${course.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.7,
        }));
    } catch {
        // Silently fail if API is unavailable during build
    }

    return [...staticRoutes, ...courseRoutes];
}
