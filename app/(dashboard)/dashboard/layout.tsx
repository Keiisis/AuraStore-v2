import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

    // Get profile for role & stores
    const [{ data: profile }, { data: stores }] = await Promise.all([
        supabase.from("profiles").select("role").eq("id", user.id).single(),
        supabase.from("stores").select("*").eq("owner_id", user.id)
    ]);

    if (!profile) {
        redirect("/login");
    }

    // Force cast to bypass narrowing issues during deployment
    const userRole = (profile as any).role;

    return (
        <div className="min-h-screen bg-[#08080A]">
            {/* Dashboard Header */}
            <DashboardHeader user={user} />
            <OrderNotificationListener />

            {/* Omni-Voice Assistant (Centralized) */}
            {stores?.[0] && (
                <AuraOmniVoice
                    storeId={stores[0].id}
                    userRole={userRole}
                />
            )}

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
