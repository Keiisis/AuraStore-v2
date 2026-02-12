"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAllUsers() {
    const supabase = createClient();
    const { data: { user: admin } } = await supabase.auth.getUser();

    if (!admin) return { error: "Non autorisé", users: [] };

    // Fetch profiles first to ensure visibility, with left join for subscriptions
    const { data: users, error } = await supabase
        .from("profiles")
        .select(`
            *,
            subscriptions (
                *,
                subscription_plans (*)
            )
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Nexus Users Fetch Error:", error);
        return { error: error.message, users: [] };
    }

    return { users: users || [] };
}

export async function updateUserRole(userId: string, role: string) {
    const supabase = createClient();
    const { data: { user: admin } } = await supabase.auth.getUser();
    if (!admin) return { error: "Non autorisé" };

    const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);

    if (error) return { error: error.message };
    revalidatePath("/admin/users");
    return { success: true };
}

export async function updateUserPlan(userId: string, planId: string) {
    const supabase = createClient();
    const { data: { user: admin } } = await supabase.auth.getUser();
    if (!admin) return { error: "Non autorisé" };

    // 1. Handle Plan Removal (Aucun Plan)
    if (!planId || planId === "") {
        const { error: deleteError } = await supabase
            .from("subscriptions")
            .delete()
            .eq("user_id", userId);

        if (deleteError) return { error: deleteError.message };
        revalidatePath("/admin/users");
        return { success: true };
    }

    // 2. Robust Upsert for Plan Change
    // We explicitly set active status and extend the period
    const { error } = await supabase
        .from("subscriptions")
        .upsert({
            user_id: userId,
            plan_id: planId,
            status: "active",
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year for admin sync
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id',
            ignoreDuplicates: false
        });

    if (error) {
        console.error("Subscription Sync Error:", error);
        return { error: `Erreur Database: ${error.message}` };
    }

    revalidatePath("/admin/users");
    return { success: true };
}

export async function deleteUser(userId: string) {
    const supabase = createClient();
    const { data: { user: admin } } = await supabase.auth.getUser();
    if (!admin) return { error: "Non autorisé" };

    // Note: This only deletes the profile. Deleting auth.user requires admin service role client which is usually handled in an edge function or a specific API route. 
    // For now, we delete the profile and associated data.
    const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

    if (error) return { error: error.message };
    revalidatePath("/admin/users");
    return { success: true };
}
