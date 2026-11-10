/** @type {import('next').NextConfig} */
const nextConfig = {
    // Add image domains if using external images (e.g. for placeholders)
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
};

export default nextConfig;
