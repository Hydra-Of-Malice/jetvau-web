import axios from 'axios';

// Same-origin by default: on Vercel /api is routed to the backend service.
// For local development without `vercel dev`, set VITE_API_URL=http://localhost:5000/api in admin/.env.
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const api = axios.create({
    baseURL: API_BASE,
});

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// A 401 on any request except the login itself means the session expired
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.includes('/admin/login');
        if (error.response?.status === 401 && !isLoginRequest) {
            localStorage.removeItem('admin_token');
            const loginPath = `${import.meta.env.BASE_URL}login`;
            if (window.location.pathname !== loginPath) {
                window.location.href = loginPath;
            }
        }
        return Promise.reject(error);
    }
);

export default api;
