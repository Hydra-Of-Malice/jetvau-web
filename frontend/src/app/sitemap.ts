import type { MetadataRoute } from "next";
import { getServerApiBase } from "@/lib/api";
import { SITE_URL } from "@/lib/constants";

// Built per request: the backend URL comes from a Vercel service binding (BACKEND_URL),
// which is only available at runtime, not during the build.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = SITE_URL;

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
        { url: `${baseUrl}/courses`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
        { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
        { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
        { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
        { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ];

    let courseRoutes: MetadataRoute.Sitemap = [];
    try {
        const res = await fetch(`${getServerApiBase()}/courses`, { cache: "no-store" });
        if (res.ok) {
            const data = await res.json();
            courseRoutes = (data.courses || []).map((course: { slug: string; updatedAt?: string }) => ({
                url: `${baseUrl}/courses/${course.slug}`,
                lastModified: course.updatedAt ? new Date(course.updatedAt) : new Date(),
                changeFrequency: "weekly" as const,
                priority: 0.7,
            }));
        }
    } catch {
        // If the API is unreachable, still return the static pages
    }

    return [...staticRoutes, ...courseRoutes];
}
