import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#050505",
                foreground: "#FAFAFA",
                surface: "#111111",
                primary: "#FE7501", // Lava Orange
                secondary: "#B4160B", // Magma Red
                accent: "#FFE946", // Sulfur Yellow
                "orange-glow": "#CA4300",
                "red-magma": "#5a1208",
                border: "rgba(255,255,255,0.08)",
            },
            fontFamily: {
                display: ["var(--font-sora)", "Sora", "sans-serif"],
                body: ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
            },
            backgroundImage: {
                "volcanic-radial": "radial-gradient(circle at 70% 30%, rgba(254, 117, 1, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 70%, rgba(180, 22, 11, 0.15) 0%, transparent 50%)",
                "glass-shine": "linear-gradient(110deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)",
            },
            animation: {
                "blob-pulse": "blobPulse 15s ease-in-out infinite alternate",
                "spin-slow": "spin 8s linear infinite",
                "shimmer": "shimmer 2.5s linear infinite",
            },
            keyframes: {
                blobPulse: {
                    "0%": { transform: "scale(1) translate(0, 0) rotate(0deg)" },
                    "50%": { transform: "scale(1.1) translate(10px, -20px) rotate(5deg)" },
                    "100%": { transform: "scale(1) translate(-10px, 10px) rotate(-5deg)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                }
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
export default config;
