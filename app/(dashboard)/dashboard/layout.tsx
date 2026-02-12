import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { OrderNotificationListener } from "@/components/dashboard/order-notification-listener";
import { AuraOmniVoice } from "@/components/shared/aura-omni-voice";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // ------------------------------------------------------------------
    // CRITICAL: Use Admin Client to Bypass RLS for Profile Check
    // If Auth is valid, we trust the ID. We don't want RLS blocking the UI.
    // ------------------------------------------------------------------
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );

    // Force non-cached query for profile check using Admin Client
    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    const { data: stores } = await supabaseAdmin
        .from("stores")
        .select("*")
        .eq("owner_id", user.id);

    if (!profile) {
        redirect("/login");
    }

    // Force cast to bypass narrowing issues during deployment
    const userRole = (profile as any).role;

    return (
        <div className="min-h-screen bg-[#08080A]">
            {/* Dashboard Header */}
            <DashboardHeader user={user} stores={stores || []} />
            <OrderNotificationListener />

            {/* Omni-Voice Assistant (Smart Context) */}
            <AuraOmniVoice
                stores={stores || []}
                userRole={userRole}
            />

            <div className="flex">
                {/* Sidebar - Fixed width 56 (224px) */}
                <DashboardSidebar stores={stores || []} />

                {/* Main Content - Adjusted for smaller sidebar */}
                <main className="flex-1 p-4 lg:p-6 ml-0 lg:ml-56 mt-14 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
