// Theme Engine Types - Core IP of AuraStore

export interface ThemeTokens {
    // Colors
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;

    // Typography
    fontDisplay: string;
    fontBody: string;

    // Spacing & Borders
    radius: string;
    radiusLg: string;
    radiusFull: string;
}

export interface BlockConfig {
    id: string;
    type: BlockType;
    props: Record<string, unknown>;
    children?: BlockConfig[];
}

export type BlockType =
    | "hero_v1"
    | "hero_v2"
    | "product_grid"
    | "product_carousel"
    | "featured_product"
    | "marquee"
    | "testimonials"
    | "newsletter"
    | "footer"
    | "header"
    | "text_block"
    | "image_banner"
    | "category_grid"
    | "spacer";

export interface ThemeConfig {
    tokens: ThemeTokens;
    layout_home: BlockConfig[];
    layout_product?: BlockConfig[];
    layout_collection?: BlockConfig[];
}

const DEFAULT_THEME_TOKENS: ThemeTokens = {
    primary: "#FE7501",
    secondary: "#B4160B",
    accent: "#FFE946",
    background: "#08080A",
    surface: "#121216",
    text: "#FFFFFF",
    textMuted: "rgba(255,255,255,0.5)",
    fontDisplay: "Sora",
    fontBody: "DM Sans",
    radius: "12px",
    radiusLg: "24px",
    radiusFull: "9999px",
};

export const DEFAULT_THEME: ThemeConfig = {
    tokens: DEFAULT_THEME_TOKENS,
    layout_home: [
        {
            id: "hero-1",
            type: "hero_v1",
            props: {
                title: "Welcome to the Future",
                subtitle: "Discover our exclusive collection",
                ctaText: "Shop Now",
                ctaLink: "/products",
                backgroundImage: null,
            },
        },
        {
            id: "products-1",
            type: "product_grid",
            props: {
                title: "Featured Products",
                limit: 4,
                columns: 4,
            },
        },
        {
            id: "marquee-1",
            type: "marquee",
            props: {
                text: "FREE SHIPPING ON ORDERS OVER $100 • NEW ARRIVALS EVERY WEEK • ",
                speed: 30,
            },
        },
    ],
};

// Vibe Presets - Pre-configured themes
export interface VibePreset {
    id: string;
    name: string;
    description: string;
    preview: string;
    tokens: Partial<ThemeTokens>;
}

export const VIBE_PRESETS: VibePreset[] = [
    {
        id: "volcanic-luxe",
        name: "Volcanic Luxe",
        description: "Sophisticated darkness with lava accents",
        preview: "/vibes/volcanic-luxe.png",
        tokens: {
            primary: "#FE7501",
            secondary: "#B4160B",
            accent: "#FFE946",
            background: "#08080A",
            surface: "#121216",
        },
    },
    {
        id: "cyber-orchid",
        name: "Cyber Orchid",
        description: "Futuristic purple and deep violet",
        preview: "/vibes/cyber-orchid.png",
        tokens: {
            primary: "#D400FF",
            secondary: "#6A00FF",
            accent: "#00F0FF",
            background: "#0A0515",
            surface: "#180C2E",
        },
    },
    {
        id: "emerald-night",
        name: "Emerald Night",
        description: "Deep forest greens and gold",
        preview: "/vibes/emerald-night.png",
        tokens: {
            primary: "#10B981",
            secondary: "#065F46",
            accent: "#FBBF24",
            background: "#050A08",
            surface: "#0D1A14",
        },
    },
    {
        id: "minimal-luxury",
        name: "Minimal Luxury",
        description: "Clean whites with gold accents",
        preview: "/vibes/minimal-luxury.png",
        tokens: {
            primary: "#C9A962",
            secondary: "#8B7355",
            accent: "#FFFFFF",
            background: "#FAFAFA",
            text: "#1A1A1A",
            textMuted: "rgba(0,0,0,0.6)",
        },
    },
    {
        id: "forest-earth",
        name: "Forest Earth",
        description: "Natural greens and earthy tones",
        preview: "/vibes/forest-earth.png",
        tokens: {
            primary: "#2D5A27",
            secondary: "#8B4513",
            accent: "#DAA520",
            background: "#1A1A14",
        },
    },
];
