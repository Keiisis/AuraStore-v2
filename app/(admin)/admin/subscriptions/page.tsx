import { createClient } from "@/lib/supabase/server";
import { CreditCard, Users, TrendingUp, Crown, Calendar, AlertTriangle } from "lucide-react";

export default async function AdminSubscriptionsPage() {
    const supabase = createClient();

    // Fetch all subscriptions with user + plan data
    const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("*, profiles:user_id(full_name, email), subscription_plans:plan_id(name, slug, price, currency)")
        .order("created_at", { ascending: false });

    // Fetch plan stats
    const { data: plans } = await supabase
        .from("subscription_plans")
        .select("id, name, slug, price")
        .eq("is_active", true)
        .order("display_order");

    // Calculate stats with type bypass for deployment stability
    const subsArray = (subscriptions || []) as any[];
    const totalActive = subsArray.filter(s => s.status === "active").length;
    const totalTrial = subsArray.filter(s => s.status === "trial").length;
    const totalRevenue = subsArray.reduce((sum, s) => {
        if (s.status === "active" && s.subscription_plans) {
            return sum + (s.subscription_plans.price || 0);
        }
        return sum;
    }, 0);

    const stats = [
        { label: "Abonnements Actifs", value: totalActive, icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-500" },
        { label: "En Période d'Essai", value: totalTrial, icon: Calendar, color: "text-blue-400", bg: "bg-blue-500" },
        { label: "Revenu Mensuel", value: `${totalRevenue.toLocaleString()} FCFA`, icon: TrendingUp, color: "text-primary", bg: "bg-primary" },
        { label: "Total Abonnés", value: subscriptions?.length || 0, icon: Users, color: "text-purple-400", bg: "bg-purple-500" },
    ];

    const statusColors: Record<string, string> = {
        active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        trial: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        past_due: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
        expired: "bg-white/5 text-white/30 border-white/10",
    };

    return (
        <div className="space-y-10">
            <div className="space-y-1">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-primary" />
                    Abonnements Live
                </h2>
                <p className="text-[11px] text-white/30 font-bold uppercase tracking-[0.2em]">Monitoring en temps-réel des souscriptions SaaS</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="volcanic-glass p-6 group hover:scale-[1.02] transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-white/[0.03] border border-white/5 ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-2xl font-black text-white">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Subscriptions Table */}
            <div className="volcanic-glass p-8 space-y-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Tous les Abonnements</h3>

                {!subscriptions?.length ? (
                    <div className="text-center py-16 space-y-4">
                        <AlertTriangle className="w-10 h-10 text-white/10 mx-auto" />
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Aucun abonnement trouvé</p>
                        <p className="text-[10px] text-white/10 font-medium">Les souscriptions apparaîtront ici quand des vendeurs choisiront un plan.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="py-3 text-[9px] font-black text-white/20 uppercase tracking-widest">Utilisateur</th>
                                    <th className="py-3 text-[9px] font-black text-white/20 uppercase tracking-widest">Plan</th>
                                    <th className="py-3 text-[9px] font-black text-white/20 uppercase tracking-widest">Statut</th>
                                    <th className="py-3 text-[9px] font-black text-white/20 uppercase tracking-widest">Paiement</th>
                                    <th className="py-3 text-[9px] font-black text-white/20 uppercase tracking-widest">Fin Période</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.map((sub: any) => (
                                    <tr key={sub.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4">
                                            <div>
                                                <p className="text-xs font-black text-white">{sub.profiles?.full_name || "—"}</p>
                                                <p className="text-[9px] text-white/30 font-medium">{sub.profiles?.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <Crown className="w-3 h-3 text-primary" />
                                                <span className="text-[10px] font-black text-white uppercase">{sub.subscription_plans?.name || "—"}</span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${statusColors[sub.status] || statusColors.expired}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-[10px] font-bold text-white/40 uppercase">{sub.payment_method || "—"}</span>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-[10px] font-bold text-white/40">
                                                {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString("fr-FR") : "—"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
