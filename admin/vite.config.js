import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The admin panel is served at /admin/ on the same domain as the site (see ../vercel.json).
// Vercel passes the full path (/admin/...) to this service, so the build output lives in
// dist/admin/ and the service's outputDirectory is dist.
export default defineConfig({
    base: '/admin/',
    plugins: [react()],
    build: {
        outDir: 'dist/admin',
        emptyOutDir: true,
    },
    server: {
        port: 5173,
    },
})
