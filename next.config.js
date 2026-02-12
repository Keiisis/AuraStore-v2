/** @type {import('next').NextConfig} */
// Force Vercel Redeploy - 2026-02-12
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "**" },
        ],
    },
    transpilePackages: ["three"],
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
};

module.exports = nextConfig;
