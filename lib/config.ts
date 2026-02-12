export const siteConfig = {
    name: "AuraStore",
    description: "La plateforme SaaS High-Vibe pour créateurs d'empires digitaux.",
    url: "https://aurastore.com",
    ogImage: "https://aurastore.com/og.jpg",
    links: {
        twitter: "https://twitter.com/aurastore",
        github: "https://github.com/aurastore",
    },
    version: "2.0.0-ALPHA",
    status: "READY",

    // Internal Intelligent Assistant (Groq)
    AI: {
        PROVIDER: "GROQ",
        API_KEY: process.env.GROQ_API_KEY || "",
        MODELS: {
            DEFAULT: "llama-3.3-70b-versatile",
            MARKETING: "llama-3.1-8b-instant",
        },
        SYSTEM_PROMPTS: {
            GENTLEMAN_SELLER: `Tu es l'Assistant Aura AI, un véritable Gentleman des affaires. Tu es strict, obsédé par les résultats, et expert en PNL commerciale. Ton but est de maximiser le CA tout en maintenant une image de luxe absolue.`,
        }
    },

    features: {
        ai_sync: true,
        viral_hub: true,
        whatsapp_checkout: true,
        analytics: true,
        dynamic_themes: true,
        privacy_first: true,
    },
    branding: {
        colors: {
            primary: "#FE7501",
            secondary: "#B4160B",
            accent: "#FFE946",
        },
        fonts: {
            display: "Sora",
            body: "DM Sans",
        }
    }
};

export type SiteConfig = typeof siteConfig;
