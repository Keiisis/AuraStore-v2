import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogOut, LayoutGrid, Users, Store, Settings, Sparkles, ShieldCheck, Crown, CreditCard, MonitorSmartphone, Palette } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

import { AuraOmniVoice } from "@/components/shared/aura-omni-voice";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Security check: Must be admin
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "admin") {
        redirect(profile ? "/dashboard" : "/login");
    }

    return (
        <div className="min-h-screen bg-[#050505]">
            {/* Header Admin */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-[#0A0A0C] border-b border-white/5 z-50 flex items-center justify-between px-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20">
                        <ShieldCheck className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-white uppercase tracking-tighter italic">Aura Admin Center</h1>
                        <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest leading-none">Super-User Interface • Elite Ops</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">Platform Live</span>
                    </div>

                    <form action={signOut}>
                        <button className="p-2 hover:bg-red-500/10 rounded-lg text-white/30 hover:text-red-400 transition-all group">
                            <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </form>
                </div>
            </header>

            {/* Master AI Assistant (No storeId needed for super-admin) */}
            <AuraOmniVoice storeId="platform" context="admin" userRole={profile?.role} />

            <div className="flex">
                {/* Sidebar Admin */}
                <aside className="fixed left-0 top-16 bottom-0 w-64 bg-[#08080A] border-r border-white/5 z-40 hidden lg:block overflow-y-auto">
                    <div className="p-6 space-y-8">
                        <div className="space-y-2">
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] px-3">Main Operations</p>
                            <nav className="space-y-1">
                                <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                                    <LayoutGrid className="w-4 h-4" />
                                    <span className="font-black text-xs uppercase tracking-wider">Vue Globale</span>
                                </Link>
                                <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                                    <Users className="w-4 h-4" />
                                    <span className="font-black text-xs uppercase tracking-wider">Utilisateurs</span>
                                </Link>
                                <Link href="/admin/stores" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                                    <Store className="w-4 h-4" />
                                    <span className="font-black text-xs uppercase tracking-wider">Boutiques</span>
                                </Link>
                                <Link href="/admin/ai-lab" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="font-black text-xs uppercase tracking-wider">AI Training</span>
                                </Link>
                            </nav>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] px-3">SaaS Engine</p>
                            <nav className="space-y-1">
                                <Link href="/admin/pricing" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                                    <Crown className="w-4 h-4" />
                                    <span className="font-black text-xs uppercase tracking-wider">Tarification System</span>
                                </Link>
                                <Link href="/admin/themes" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                                    <Palette className="w-4 h-4" />
                                    <span className="font-black text-xs uppercase tracking-wider">Design System</span>
                                </Link>
                                <Link href="/admin/frontend" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                                    <MonitorSmartphone className="w-4 h-4" />
                                    <span className="font-black text-xs uppercase tracking-wider">FrontEnd Master</span>
                                </Link>
                                <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                                    <Settings className="w-4 h-4" />
                                    <span className="font-black text-xs uppercase tracking-wider">Système</span>
                                </Link>
                            </nav>
                        </div>

                        {/* System Health */}
                        <div className="volcanic-glass p-5 space-y-4 border-white/5">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Health Console</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-white/40 font-bold uppercase">Database</span>
                                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-tighter">Connected</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-white/40 font-bold uppercase">AI Compute</span>
                                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-tighter">Stable</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 ml-0 lg:ml-64 mt-16 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div >
        </div >
    );
}
