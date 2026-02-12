"use server";

import { revalidatePath, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { z } from "zod";
import { DEFAULT_THEME } from "@/lib/theme-engine/types";
import { getUserPlanLimits } from "./plans";

// Validation schemas
const createStoreSchema = z.object({
    founder_name: z.string().min(2, "Le nom du fondateur est requis"),
    name: z.string().min(2, "Le nom de la boutique doit faire au moins 2 caractères"),
    slug: z
        .string()
        .min(3, "Le slug doit faire au moins 3 caractères")
        .max(30, "Le slug ne doit pas dépasser 30 caractères")
        .regex(/^[a-z0-9-]+$/, "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets"),
    description: z.string().min(10, "Une description d'au moins 10 caractères est requise pour le SEO"),
    category: z.string().min(1, "Veuillez choisir une catégorie"),
    whatsapp_number: z.string().min(8, "Un numéro WhatsApp valide est requis"),
    logo_url: z.string().optional().nullable(),
    banner_url: z.string().optional().nullable(),
});

const updateStoreSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    logo_url: z.string().optional().nullable(),
    banner_url: z.string().optional().nullable(),
    custom_domain: z.string().optional().nullable(),
    whatsapp_number: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
    theme_config: z.any().optional(),
    payment_config: z.any().optional(),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;

// Create a new store — WITH PLAN ENFORCEMENT
export async function createStore(input: CreateStoreInput) {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "You must be logged in to create a store" };
    }

    // Validate input
    const validatedFields = createStoreSchema.safeParse(input);
    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { name, slug, description, category, logo_url, banner_url, founder_name, whatsapp_number } = validatedFields.data;

    // Check if slug is already taken
    const { data: existingStore } = await supabase
        .from("stores")
        .select("id")
        .eq("slug", slug)
        .single();

    if (existingStore) {
        return { error: "This store URL is already taken" };
    }

    // ============================================================
    // SAAS ENGINE: Plan-based store limit enforcement
    // ============================================================
    const limits = await getUserPlanLimits(user.id);

    if (!limits) {
        return { error: "Impossible de vérifier votre abonnement. Veuillez réessayer." };
    }

    // If no subscription and not admin, block
    if (limits.subscription_status === "none" && !limits.is_admin) {
        return { error: "ABONNEMENT REQUIS: Vous devez souscrire à un plan pour créer une boutique. Consultez nos tarifs." };
    }

    // Check store count against plan limit
    if (limits.max_stores !== -1) {
        const { count } = await supabase
            .from("stores")
            .select("*", { count: "exact", head: true })
            .eq("owner_id", user.id);

        if (count !== null && count >= limits.max_stores) {
            return {
                error: `LIMITE PLAN ${limits.plan_name.toUpperCase()}: Vous avez atteint le maximum de ${limits.max_stores} boutique(s). Passez au plan supérieur pour en créer davantage.`
            };
        }
    }

    const VIBE_MAPPING: Record<string, string> = {
        streetwear: "streetwear",
        techwear: "techwear",
        traditionnel: "traditionnel",
        sneakers: "sneakers",
        bijoux: "bijoux",
        cosmetiques: "cosmetiques",
        sacs: "sacs",
        accessoires: "accessoires",
        y2k: "y2k",
        minimalist: "minimalist",
    };

    const selectedThemeSlug = VIBE_MAPPING[category] || "streetwear";

    // Fetch theme from DB
    const { data: dbTheme } = await supabase
        .from("store_themes")
        .select("colors")
        .eq("slug", selectedThemeSlug)
        .single();

    const themeColors = dbTheme?.colors || ["#000000", "#FF4D00", "#FFFFFF"];

    const storeData: any = {
        owner_id: user.id,
        name,
        slug,
        description: description || null,
        whatsapp_number: whatsapp_number || null,
        category: category,
        logo_url: logo_url || null,
        banner_url: banner_url || null,
        theme_config: {
            ...DEFAULT_THEME,
            tokens: {
                ...DEFAULT_THEME.tokens,
                primary: themeColors[1] || DEFAULT_THEME.tokens.primary,
                secondary: themeColors[0] || DEFAULT_THEME.tokens.secondary,
                accent: themeColors[2] || themeColors[1] || DEFAULT_THEME.tokens.accent,
            },
            category,
        },
        is_active: true,
    };

    // Create the store
    const { data: store, error: storeError } = await supabase
        .from("stores")
        .insert(storeData)
        .select()
        .single();

    if (storeError) {
        return { error: storeError.message };
    }

    // Update user profile name
    await supabase.from("profiles").update({ full_name: founder_name }).eq("id", user.id);

    revalidatePath("/dashboard");
    redirect(`/dashboard/${store.slug}`);
}

// Update an existing store
export async function updateStore(input: UpdateStoreInput) {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "You must be logged in to update a store" };
    }

    const validatedFields = updateStoreSchema.safeParse(input);
    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { id, ...updateData } = validatedFields.data;

    // Verify ownership (or admin)
    const { data: existingStore } = await supabase
        .from("stores")
        .select("owner_id, slug")
        .eq("id", id)
        .single();

    // Admin bypasses ownership check
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const isAdmin = profile?.role === "admin";

    if (!existingStore || (!isAdmin && existingStore.owner_id !== user.id)) {
        return { error: "Store not found or you don't have permission to update it" };
    }

    // Custom domain check against plan
    if (updateData.custom_domain) {
        const limits = await getUserPlanLimits(user.id);
        if (limits && !limits.has_custom_domain && !limits.is_admin) {
            return { error: "UPGRADE REQUIS: Les domaines personnalisés nécessitent le plan Pro ou supérieur." };
        }
    }

    console.log("Supabase Update Data:", updateData);
    const { error } = await supabase
        .from("stores")
        .update(updateData as any)
        .eq("id", id);

    if (error) {
        console.error("Supabase Error detail:", error);
        return { error: `Failed to update store: ${error.message}` };
    }

    revalidatePath(`/dashboard/${existingStore.slug}`);
    revalidatePath("/dashboard");
    return { success: true };
}

// Delete a store
export async function deleteStore(storeId: string) {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "You must be logged in to delete a store" };
    }

    const { data: existingStore } = await supabase
        .from("stores")
        .select("owner_id")
        .eq("id", storeId)
        .single();

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const isAdmin = profile?.role === "admin";

    if (!existingStore || (!isAdmin && existingStore.owner_id !== user.id)) {
        return { error: "Store not found or you don't have permission to delete it" };
    }

    // 1. CLEANUP: Delete all associated images (Products + Branding)
    // Fetch store branding + all product images
    const { data: storeProducts } = await supabase
        .from("products")
        .select("images")
        .eq("store_id", storeId);

    const imagesToDelete: string[] = [];

    // Add store branding
    if (existingStore.logo_url) imagesToDelete.push(existingStore.logo_url);
    if (existingStore.banner_url) imagesToDelete.push(existingStore.banner_url);

    // Add product images
    storeProducts?.forEach(p => {
        if (p.images && Array.isArray(p.images)) {
            imagesToDelete.push(...p.images);
        }
    });

    if (imagesToDelete.length > 0) {
        const filePaths = imagesToDelete.map((url: string) => {
            try {
                const urlObj = new URL(url);
                const pathParts = urlObj.pathname.split("/store-assets/");
                return pathParts.length > 1 ? pathParts[1] : null;
            } catch (e) { return null; }
        }).filter((p: any) => p !== null) as string[];

        // Batch delete (Supabase Storage supports batch)
        if (filePaths.length > 0) {
            // Processing in chunks of 50 to be safe
            const chunkSize = 50;
            for (let i = 0; i < filePaths.length; i += chunkSize) {
                const chunk = filePaths.slice(i, i + chunkSize);
                await supabase.storage.from("store-assets").remove(chunk);
            }
        }
    }

    const { error } = await supabase
        .from("stores")
        .delete()
        .eq("id", storeId);

    if (error) {
        console.error("Error deleting store:", error);
        return { error: "Failed to delete store. Please try again." };
    }

    revalidatePath("/dashboard");
    redirect("/dashboard");
}

// Get store by slug
export const getStoreBySlug = unstable_cache(
    async (slug: string) => {
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { auth: { persistSession: false } }
        );

        const { data: store, error } = await supabaseAdmin
            .from("stores")
            .select("*")
            .eq("slug", slug)
            .maybeSingle();

        if (error) {
            return null;
        }

        return store;
    },
    ["store-by-slug"],
    { revalidate: 3600, tags: ["stores"] }
);
