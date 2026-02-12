"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface FrontendConfig {
    id: number;
    hero_title: string;
    hero_subtitle: string;
    hero_cta_primary: string;
    hero_cta_secondary: string;
    brand_name: string;
    logo_url: string | null;
    primary_color: string;
    brand_color_start?: string;
    brand_color_end?: string;
    show_hero: boolean;
    show_features: boolean;
    show_themes: boolean;
    show_steps: boolean;
    show_pricing: boolean;
    show_footer: boolean;
    show_live_stats: boolean;
    seo_title: string;
    seo_description: string;
}

// ---- GET CONFIG (Public) ----
export async function getFrontendConfig() {
    const supabase = createClient();

    // Try to get config
    const { data, error } = await supabase
        .from("frontend_config")
        .select("*")
        .eq("id", 1)
        .single();

    if (error || !data) {
        // Fallback default config if DB table missing or empty
        return {
            hero_title: "La Plateforme E-commerce Ultime",
            hero_subtitle: "Créez votre boutique en ligne en 30 secondes.",
            hero_cta_primary: "Commencer",
            hero_cta_secondary: "Démo",
            brand_name: "AuraStore",
            primary_color: "#00ff9d",
            show_hero: true,
            show_features: true,
            show_themes: true,
            show_steps: true,
            show_pricing: true,
            show_footer: true,
            show_live_stats: true,
            seo_title: "AuraStore",
            seo_description: "E-commerce platform",
        } as FrontendConfig;
    }

    return data as FrontendConfig;
}

// ---- UPDATE CONFIG (Admin Only) ----
export async function updateFrontendConfig(input: Partial<FrontendConfig>) {
    const supabase = createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non connecté" };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") return { error: "Accès refusé" };

    const { error } = await supabase
        .from("frontend_config")
        .update({
            ...input,
            updated_at: new Date().toISOString()
        })
        .eq("id", 1);

    if (error) return { error: error.message };

    revalidatePath("/");
    revalidatePath("/admin/frontend");
    return { success: true };
}
