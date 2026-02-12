/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { hostname: 'etzunbqflskvjpnathqa.supabase.co' },
            { hostname: 'soqbqmpjskgp.supabase.co' },
            { hostname: 'images.unsplash.com' }
        ],
    },
    transpilePackages: ["three"],
};

module.exports = nextConfig;
