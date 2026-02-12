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

    // Force non-cached query for profile check
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle(); // Use maybeSingle to avoid 406 error throw

    const { data: stores } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", user.id);

    if (!profile) {
        // DIAGNOSTIC MODE: Instead of redirecting, show error to confirm if it's a profile issue
        // redirect("/login");
        return (
            <div className="min-h-screen bg-[#08080A] flex flex-col items-center justify-center text-white p-4">
                <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                    <h1 className="text-xl font-bold mb-2">Profil Introuvable</h1>
                    <p className="text-white/60 mb-6 text-sm">
                        Votre compte utilisateur existe ({user.email}), mais votre profil vendeur semble manquant en base de données.
                    </p>
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono mb-6 overflow-hidden text-left">
                        ID: {user.id}<br />
                        Role: {user.role}<br />
                        Provider: {user.app_metadata.provider}
                    </div>
                    <form action={async () => {
                        "use server";
                        const sb = createClient();
                        await sb.auth.signOut();
                        redirect("/login");
                    }}>
                        <button className="w-full py-3 bg-white text-black font-bold rounded-xl hover:scale-[1.02] transition-transform">
                            Se déconnecter et Réessayer
                        </button>
                    </form>
                </div>
            </div>
        );
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
