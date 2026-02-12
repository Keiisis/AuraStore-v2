import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatPrice, CurrencyCode } from "@/lib/currency-engine";
import { AiBusinessPulse } from "@/components/dashboard/ai-business-pulse";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { AiAcquisitionAdvice } from "@/components/dashboard/ai-acquisition-advice";

export default async function AnalyticsPage({ params }: { params: { slug: string } }) {
    const supabase = createClient();

    // Fetch store
    const { data: store } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", params.slug)
        .single();

    if (!store) return notFound();

    // Intelligence: Detect Store Currency
    const storeCurrency = (store.payment_config as any)?.currency || "XOF" as CurrencyCode;

    // Fetch orders for CA analysis (Last 60 days for comparison)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: allOrders } = await supabase
        .from("orders")
        .select("*")
        .eq("store_id", store.id)
        .gte("created_at", sixtyDaysAgo.toISOString());

    const allPaidOrders = allOrders?.filter(o => ["paid", "delivered"].includes(o.status)) || [];

    const currentOrders = allPaidOrders.filter(o => o.created_at >= thirtyDaysAgo.toISOString());
    const previousOrders = allPaidOrders.filter(o => o.created_at < thirtyDaysAgo.toISOString());

    const totalRevenue = currentOrders.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const transactionCount = currentOrders.length || 0;

    const prevRevenue = previousOrders.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const prevCount = previousOrders.length || 0;

    const revenueGrowth = prevRevenue === 0 ? 100 : Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100);
    const countGrowth = prevCount === 0 ? 100 : Math.round(((transactionCount - prevCount) / prevCount) * 100);

    // Group sales by day for the chart
    const dailySales = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayTotal = currentOrders
            .filter(o => o.created_at.startsWith(dateStr))
            .reduce((sum, o) => sum + (o.total || 0), 0);

        return { date: dateStr, total: dayTotal };
    }).reverse();

    // AI Intelligence: Prediction Logic (7 days)
    const avgDailySales = transactionCount > 0 ? totalRevenue / 30 : 0;
    const growthTrend = transactionCount > 5 ? 1.05 : 1.02; // Elite Growth Factor

    const futureSales = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i + 1);
        const dateStr = date.toISOString().split('T')[0];

        const predictedTotal = avgDailySales * Math.pow(growthTrend, i + 1);

        return { date: dateStr, total: Math.round(predictedTotal) };
    });

    return (
        <div className="space-y-8 pt-16 scale-[0.98] transform-gpu">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">Performance</p>
                    <h1 className="font-display text-4xl font-black text-white">
                        Tableau <span className="text-primary italic">D'Élite</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.05]">
                    <button className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-white text-black transition-all shadow-[0_5px_15px_rgba(255,255,255,0.1)]">Temps Réel</button>
                    <button className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-white/40 hover:text-white transition-all">Historique</button>
                </div>
            </div>

            {/* AI Business Pulse - CENTRALIZED & DYNAMIC */}
            <AiBusinessPulse
                revenue={totalRevenue}
                ordersCount={transactionCount}
                storeName={store.name}
                ordersData={allPaidOrders}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <AnalyticCard
                    label="Revenus 30J"
                    value={formatPrice(totalRevenue, storeCurrency)}
                    trend={`${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}%`}
                    icon={<DollarSign className="w-4 h-4" />}
                />
                <AnalyticCard
                    label="Empire Aura"
                    value="VIP"
                    trend="Elite"
                    icon={<Users className="w-4 h-4" />}
                />
                <AnalyticCard
                    label="Ventes Validées"
                    value={transactionCount.toString()}
                    trend={`${countGrowth >= 0 ? '+' : ''}${countGrowth}%`}
                    icon={<TrendingUp className="w-4 h-4" />}
                />
                <AnalyticCard
                    label="Visibilité"
                    value="MAX"
                    trend="+100%"
                    icon={<BarChart3 className="w-4 h-4" />}
                />
            </div>

            {/* AI Intelligence: Dynamic Sales & Strategic Advice */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <SalesChart data={dailySales} predictions={futureSales} currency={storeCurrency} />
                </div>
                <div className="xl:col-span-1 h-full flex flex-col gap-6">
                    <AiAcquisitionAdvice storeName={store.name} ordersData={currentOrders} />

                    {/* Elite Clients Aura */}
                    <div className="glass-card rounded-[2.5rem] p-8 border border-white/[0.03] space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-white/60 uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-3.5 h-3.5 text-primary" />
                                Élite Aura
                            </h4>
                            <span className="text-[8px] font-black text-primary uppercase">Top Clients</span>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(currentOrders.reduce((acc, o) => {
                                acc[o.customer_name] = (acc[o.customer_name] || 0) + (o.total || 0);
                                return acc;
                            }, {} as Record<string, number>))
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 3)
                                .map(([name, total], i) => (
                                    <div key={i} className="flex items-center justify-between group/client">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black text-white/40 group-hover/client:border-primary/20 transition-all">
                                                {name[0]}
                                            </div>
                                            <p className="text-[11px] font-black text-white/80 uppercase tracking-tight">{name}</p>
                                        </div>
                                        <p className="text-[10px] font-black text-primary">{formatPrice(total, storeCurrency)}</p>
                                    </div>
                                ))}
                            {currentOrders.length === 0 && <p className="text-[10px] text-white/20 font-black uppercase text-center py-4 italic">En attente de flux</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AnalyticCard({ label, value, trend, icon }: { label: string, value: string, trend: string, icon: React.ReactNode }) {
    return (
        <div className="glass-card rounded-[2rem] p-8 border border-white/[0.03] hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-500 group">
            <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40 group-hover:text-primary transition-colors">
                    {icon}
                </div>
                <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">{trend}</span>
            </div>
            <div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">{label}</p>
                <p className="text-3xl font-black text-white font-display tracking-tight group-hover:scale-105 transition-transform origin-left">{value}</p>
            </div>
        </div>
    );
}
