/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "**" },
        ],
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Provide a way to skip type checking during build for rapid iteration,
        // but generally should be kept false for production reliability.
        ignoreBuildErrors: true,
    }
};

export default nextConfig;
