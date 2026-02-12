"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================================
// AURASTORE PLAN ENGINE — Full CRUD + Feature Gating
// ============================================================

export interface PlanInput {
    name: string;
    slug: string;
    description: string;
    price: number;
    currency?: string;
    billing_cycle?: string;
    is_custom_price?: boolean;
    max_stores: number;
    max_products_per_store: number;
    max_photos_sync: number;
    has_analytics: boolean;
    has_seo_ai: boolean;
    has_viral_hub: boolean;
    has_vto_3d: boolean;
    has_api_access: boolean;
    has_custom_domain: boolean;
    has_multi_admin: boolean;
    has_dedicated_manager: boolean;
    support_level: string;
    icon_name: string;
    accent_color: string;
    is_popular: boolean;
    display_order: number;
    is_active: boolean;
    features_list: string[];
}

// ---- GET ALL PLANS (public) ----
export async function getPlans() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("display_order", { ascending: true });

    if (error) return { error: error.message, plans: [] };
    return { plans: data || [] };
}

// ---- GET ACTIVE PLANS (for landing page) ----
export async function getActivePlans() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

    if (error) return [];
    return data || [];
}

// ---- GET SINGLE PLAN ----
export async function getPlan(planId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("id", planId)
        .single();

    if (error) return null;
    return data;
}

// ---- CREATE PLAN (Admin only) ----
export async function createPlan(input: PlanInput) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non autorisé" };

    // Verify admin
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") return { error: "Accès refusé: privilèges Master requis" };

    const { error } = await supabase
        .from("subscription_plans")
        .insert({
            ...input,
            features_list: input.features_list,
        });

    if (error) return { error: error.message };

    revalidatePath("/admin/plans");
    revalidatePath("/");
    return { success: true };
}

// ---- UPDATE PLAN (Admin only) ----
export async function updatePlan(planId: string, input: Partial<PlanInput>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non autorisé" };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") return { error: "Accès refusé" };

    const { error } = await supabase
        .from("subscription_plans")
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("id", planId);

    if (error) return { error: error.message };

    revalidatePath("/admin/plans");
    revalidatePath("/");
    return { success: true };
}

// ---- DELETE PLAN (Admin only) ----
export async function deletePlan(planId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non autorisé" };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") return { error: "Accès refusé" };

    // Check if any active subscriptions use this plan
    const { count } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("plan_id", planId);

    if (count && count > 0) {
        return { error: `Impossible: ${count} abonnement(s) actif(s) utilisent ce plan. Désactivez-le plutôt.` };
    }

    const { error } = await supabase
        .from("subscription_plans")
        .delete()
        .eq("id", planId);

    if (error) return { error: error.message };

    revalidatePath("/admin/plans");
    revalidatePath("/");
    return { success: true };
}

// ---- GET USER PLAN LIMITS (Feature Gating Engine) ----
export async function getUserPlanLimits(userId?: string) {
    const supabase = createClient();

    let targetUserId = userId;
    if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        targetUserId = user.id;
    }

    // Check if admin (unlimited access)
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", targetUserId)
        .single();

    if (profile?.role === "admin") {
        return {
            plan_name: "Master Admin",
            plan_slug: "admin",
            max_stores: -1,
            max_products_per_store: -1,
            max_photos_sync: -1,
            has_analytics: true,
            has_seo_ai: true,
            has_viral_hub: true,
            has_vto_3d: true,
            has_api_access: true,
            has_custom_domain: true,
            has_multi_admin: true,
            support_level: "dedicated",
            subscription_status: "active" as const,
            is_admin: true,
        };
    }

    // Get user's subscription + plan
    const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*, subscription_plans(*)")
        .eq("user_id", targetUserId)
        .single();

    if (!subscription || !subscription.subscription_plans) {
        return {
            plan_name: "Aucun Plan",
            plan_slug: "free",
            max_stores: 0,
            max_products_per_store: 0,
            max_photos_sync: 0,
            has_analytics: false,
            has_seo_ai: false,
            has_viral_hub: false,
            has_vto_3d: false,
            has_api_access: false,
            has_custom_domain: false,
            has_multi_admin: false,
            support_level: "none",
            subscription_status: "none" as const,
            is_admin: false,
        };
    }

    const plan = subscription.subscription_plans as any;
    return {
        plan_name: plan.name,
        plan_slug: plan.slug,
        max_stores: plan.max_stores,
        max_products_per_store: plan.max_products_per_store,
        max_photos_sync: plan.max_photos_sync,
        has_analytics: plan.has_analytics,
        has_seo_ai: plan.has_seo_ai,
        has_viral_hub: plan.has_viral_hub,
        has_vto_3d: plan.has_vto_3d,
        has_api_access: plan.has_api_access,
        has_custom_domain: plan.has_custom_domain,
        has_multi_admin: plan.has_multi_admin,
        support_level: plan.support_level,
        subscription_status: subscription.status,
        is_admin: false,
    };
}

// ---- SUBSCRIBE USER TO PLAN ----
export async function subscribeToPlan(planSlug: string, paymentMethod: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non autorisé" };

    // Get plan
    const { data: plan } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("slug", planSlug)
        .eq("is_active", true)
        .single();

    if (!plan) return { error: "Plan introuvable ou inactif" };

    // Upsert subscription
    const { error } = await supabase
        .from("subscriptions")
        .upsert({
            user_id: user.id,
            plan_id: plan.id,
            status: "active",
            payment_method: paymentMethod,
            started_at: new Date().toISOString(),
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }, { onConflict: "user_id" });

    if (error) return { error: error.message };

    // Update user role to seller if not admin
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        await supabase
            .from("profiles")
            .update({ role: "seller" })
            .eq("id", user.id);
    }

    // Record payment
    await supabase.from("payment_history").insert({
        user_id: user.id,
        plan_id: plan.id,
        amount: plan.price,
        currency: plan.currency,
        payment_method: paymentMethod,
        status: "completed",
    });

    revalidatePath("/dashboard");
    return { success: true };
}
