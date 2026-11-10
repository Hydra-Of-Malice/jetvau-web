// Browser requests go to the same origin. On Vercel the /api path is routed to the backend service.
// For local development without `vercel dev`, set NEXT_PUBLIC_API_URL=http://localhost:5000/api.
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/$/, "");

// Server-side code (e.g. sitemap.ts) can't use a relative URL. On Vercel the backend service URL is
// injected at runtime as BACKEND_URL through a service binding (see vercel.json).
export function getServerApiBase() {
    if (process.env.BACKEND_URL) {
        return `${process.env.BACKEND_URL.replace(/\/$/, "")}/api`;
    }
    if (/^https?:\/\//.test(API_BASE)) return API_BASE;
    return "http://localhost:5000/api";
}

async function parseJson(res: Response) {
    try {
        return await res.json();
    } catch {
        return {};
    }
}

async function request(method: string, endpoint: string, body?: unknown, token?: string | null) {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache: "no-store",
    });
    const data = await parseJson(res);
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
}

export function apiGet(endpoint: string, token?: string | null) {
    return request("GET", endpoint, undefined, token);
}

export function apiPost(endpoint: string, body: unknown, token?: string | null) {
    return request("POST", endpoint, body, token);
}

export function apiPut(endpoint: string, body: unknown, token?: string | null) {
    return request("PUT", endpoint, body, token);
}

export { API_BASE };
