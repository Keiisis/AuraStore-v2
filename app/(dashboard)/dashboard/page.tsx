import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get user profile with role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    // Redirection based on role
    if (profile?.role === "admin") {
        redirect("/admin");
    }

    // Default for sellers: Get user's stores
    const { data: stores } = await supabase
        .from("stores")
        .select("slug")
        .eq("owner_id", user.id);

    if (stores && stores.length > 0) {
        // Redirect to the first store dashboard
        redirect(`/dashboard/${stores[0].slug}`);
    } else {
        // Force new store creation if none exist
        redirect("/dashboard/new-store");
    }
}
