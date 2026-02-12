import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSettingsClient } from "@/components/admin/settings-client";

export default async function AdminSettingsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const { data: configs } = await supabase
        .from("system_configs")
        .select("*");

    return <AdminSettingsClient profile={profile} initialConfigs={configs || []} />;
}
