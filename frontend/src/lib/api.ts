const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function apiGet(endpoint: string, token?: string | null) {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, { headers, cache: "no-store" });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `API error: ${res.status}`);
    }
    return res.json();
}

export async function apiPost(endpoint: string, body: unknown, token?: string | null) {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `API error: ${res.status}`);
    return data;
}

export { API_BASE };
