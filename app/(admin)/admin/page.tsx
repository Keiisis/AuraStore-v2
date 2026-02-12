import { createClient } from "@/lib/supabase/server";
import {
    Users,
    Store,
    TrendingUp,
    Activity,
    ArrowUpRight,
    Search,
    Filter
} from "lucide-react";
import Image from "next/image";

export default async function AdminDashboardPage() {
    const supabase = createClient();

    // Fetch platform stats
    const [
        { count: userCount },
        { count: storeCount },
        { data: recentStores }
    ] = await Promise.all([
        supabase.from("profiles").select("*", { count: 'exact', head: true }),
        supabase.from("stores").select("*", { count: 'exact', head: true }),
        supabase.from("stores").select("*, profiles(email)").order('created_at', { ascending: false }).limit(5)
    ]);

    const stats = [
        { label: "Total Users", value: userCount || 0, icon: Users, color: "text-blue-400", trend: "+12%" },
        { label: "Active Stores", value: storeCount || 0, icon: Store, color: "text-primary", trend: "+5%" },
        { label: "Platform Volume", value: "0€", icon: TrendingUp, color: "text-emerald-400", trend: "0%" },
        { label: "AI Requests", value: "1,2k", icon: Activity, color: "text-purple-400", trend: "+24%" },
    ];

    return (
        <div className="space-y-10">
            {/* Page Title */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Control Tower</h2>
                    <p className="text-[11px] text-white/30 font-bold uppercase tracking-[0.2em]">Monitoring the SaasAura Global Ecosystem</p>
                </div>

                <div className="flex gap-2">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-primary transition-colors" />
                        <input
                            placeholder="RECHERCHER BOUTIQUE..."
                            className="bg-white/[0.03] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-[10px] font-black uppercase tracking-wider focus:outline-none focus:border-primary/50 transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="volcanic-glass p-6 group hover:scale-[1.02] transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-white/[0.03] border border-white/5 ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{stat.trend}</span>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-2xl font-black text-white">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lower Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Stores */}
                <div className="lg:col-span-2 volcanic-glass p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Dernières Boutiques</h3>
                        <button className="text-[10px] font-black text-primary hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1">
                            Tout voir <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {recentStores?.map((store: any) => (
                            <div key={store.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 hover:bg-white/[0.04] transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/5 overflow-hidden relative">
                                        {store.logo_url ? (
                                            <Image
                                                src={store.logo_url}
                                                alt={store.name}
                                                fill
                                                className="object-contain p-2"
                                            />
                                        ) : (
                                            <Store className="w-5 h-5 text-white/20" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase">{store.name}</p>
                                        <p className="text-[9px] text-white/30 font-bold uppercase tracking-tighter">{store.profiles?.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-white uppercase">{new Date(store.created_at).toLocaleDateString()}</p>
                                    <p className="text-[8px] text-primary font-black uppercase tracking-widest">Abonnement Pro</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Platform Alerts */}
                <div className="volcanic-glass p-8 space-y-6 bg-primary/[0.01]">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Système Status</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">API Gateway</p>
                            <p className="text-[9px] text-emerald-400/60 font-medium">Réponse moyenne: 124ms</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Database Latency</p>
                            <p className="text-[9px] text-emerald-400/60 font-medium">Health Index: 99.9%</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Cron Jobs</p>
                            <p className="text-[9px] text-primary/60 font-medium">Prochaine synchro: 14:00</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
