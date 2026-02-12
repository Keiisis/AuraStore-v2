import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "@/components/dashboard/settings-client";

export default async function SettingsPage({ params }: { params: { slug: string } }) {
    const supabase = createClient();
    const { data: store } = await supabase.from("stores").select("*").eq("slug", params.slug).single();

    if (!store) return null;

    return (
        <div className="space-y-8 pt-16 scale-[0.98] transform-gpu">
            {/* Header */}
            <div className="space-y-1">
                <p className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">Configuration</p>
                <h1 className="font-display text-3xl font-black text-white">
                    Paramètres
                </h1>
            </div>

            <SettingsClient store={store} />
        </div>
    );
}

function SettingsNavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? "bg-white/[0.05] text-white" : "text-white/30 hover:bg-white/[0.02] hover:text-white/60"}`}>
            {icon}
            <span className="text-xs font-bold uppercase tracking-tight">{label}</span>
        </button>
    );
}
