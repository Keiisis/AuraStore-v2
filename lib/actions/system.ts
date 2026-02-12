"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAIConfig() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("ai_config")
        .select("*")
        .eq("is_active", true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') return { error: error.message };

    // Merge DB config with environment variables for a seamless dev experience
    const config = {
        id: data?.id,
        provider: data?.provider || 'replicate',
        fal_key: data?.fal_key || "",
        replicate_key: data?.replicate_key || process.env.REPLICATE_API_TOKEN || "",
        groq_key: data?.groq_key || process.env.GROQ_API_KEY || "",
        is_active: data?.is_active ?? true,
        updated_at: data?.updated_at
    };

    return { config };
}

export async function updateAIConfig(formData: any) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Non autorisé" };

    // Find the first active config if ID is missing (singleton pattern)
    let targetId = formData.id;
    if (!targetId) {
        const { data: existing } = await supabase
            .from("ai_config")
            .select("id")
            .eq("is_active", true)
            .limit(1)
            .single();
        if (existing) targetId = existing.id;
    }

    const { error } = await supabase
        .from("ai_config")
        .upsert({
            id: targetId || undefined,
            provider: formData.provider,
            fal_key: formData.fal_key,
            replicate_key: formData.replicate_key,
            groq_key: formData.groq_key,
            is_active: true,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error("AI Config Update Error:", error);
        return { error: `Database Error: ${error.message}` };
    }

    revalidatePath("/admin/themes");
    return { success: true };
}

export async function getSystemPaymentConfigs() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("system_payment_configs")
        .select("*")
        .order('provider', { ascending: true });

    if (error) return { error: error.message };
    return { configs: data || [] };
}

export async function updateSystemPaymentConfig(id: string, configData: any) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Non autorisé" };

    const { error } = await supabase
        .from("system_payment_configs")
        .update({
            config_data: configData,
            updated_at: new Date().toISOString()
        })
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/settings");
    return { success: true };
}
