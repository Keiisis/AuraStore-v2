import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Package, ShoppingCart, DollarSign, TrendingUp, ArrowUpRight, Plus, Globe, Palette, Users } from "lucide-react";
import Link from "next/link";
import { formatPrice, CurrencyCode } from "@/lib/currency-engine";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { AiAcquisitionAdvice } from "@/components/dashboard/ai-acquisition-advice";

interface StoreDashboardPageProps {
    params: {
        slug: string;
    };
}

export default async function StoreDashboardPage({ params }: StoreDashboardPageProps) {
    const { slug } = params;
    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Use Admin Client to bypass RLS
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
    );

    // Get store details
    const { data: store, error } = await supabaseAdmin
        .from("stores")
        .select("*")
        .eq("slug", slug)
        .eq("owner_id", user.id)
        .maybeSingle();

    if (error || !store) {
        notFound();
    }

    // Intelligence: Detect Store Currency
    const storeCurrency = (store.payment_config as any)?.currency || "XOF" as CurrencyCode;

    // Get product count for this store
    const { count: productCount } = await supabaseAdmin
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("store_id", store.id);

    // Get stats & 60-day history (for growth comparison)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: salesDataData } = await supabaseAdmin
        .from("orders")
        .select("total, created_at, status")
        .eq("store_id", store.id)
        .gte("created_at", sixtyDaysAgo.toISOString());

    const allPaidOrders = salesDataData?.filter(o => ["paid", "delivered"].includes(o.status)) || [];

    const currentOrders = allPaidOrders.filter(o => o.created_at >= thirtyDaysAgo.toISOString());
    const previousOrders = allPaidOrders.filter(o => o.created_at < thirtyDaysAgo.toISOString());

    const totalSales = currentOrders.length;
    const totalRevenue = currentOrders.reduce((sum, order) => sum + Number(order.total), 0) || 0;

    const prevSales = previousOrders.length;
    const prevRevenue = previousOrders.reduce((sum, order) => sum + Number(order.total), 0) || 0;

    const salesGrowth = prevSales === 0 ? 100 : Math.round(((totalSales - prevSales) / prevSales) * 100);
    const revenueGrowth = prevRevenue === 0 ? 100 : Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100);

    // Group sales by day (for current 30 days)
    const dailySales = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayTotal = currentOrders
            .filter(o => o.created_at.startsWith(dateStr))
            .reduce((sum, o) => sum + Number(o.total), 0);

        return { date: dateStr, total: dayTotal };
    }).reverse();

    // AI Intelligence: Prediction Logic (7 days)
    const avgDailySales = totalSales > 0 ? totalRevenue / 30 : 0;
    const growthTrend = totalSales > 5 ? 1.05 : 1.02; // Elite Growth Factor

    const futureSales = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i + 1);
        const dateStr = date.toISOString().split('T')[0];

        // Dynamic prediction based on average + compounding growth
        const predictedTotal = avgDailySales * Math.pow(growthTrend, i + 1);

        return { date: dateStr, total: Math.round(predictedTotal) };
    });

    // Get recent products
    const { data: recentProducts } = await supabaseAdmin
        .from("products")
        .select("*")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false })
        .limit(5);

    // Get recent orders (Activity Feed)
    const { data: recentOrders } = await supabase
        .from("orders")
        .select("*")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false })
        .limit(4);

    return (
        <div className="space-y-6 scale-[0.98] transform-gpu">
            {/* Store Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-0.5">
                    <h1 className="font-display text-3xl font-black text-white tracking-tight">
                        {store.name} <span className="text-primary ml-2 uppercase text-[10px] tracking-[0.4em] bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Elite Hub</span>
                    </h1>
                    <div className="flex items-center gap-3">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                            <Globe className="w-3 h-3" />
                            {store.slug}.aurastore.com
                        </p>
                        <Link
                            href={`https://${store.slug}.localhost:3000`}
                            target="_blank"
                            className="text-[9px] font-black text-primary hover:text-accent transition-colors uppercase tracking-widest flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg"
                        >
                            Propager <ArrowUpRight className="w-2.5 h-2.5" />
                        </Link>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/dashboard/${slug}/products/new`}
                        className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/[0.05] rounded-xl transition-all text-[11px] font-black uppercase tracking-widest"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Nouveau Produit
                    </Link>
                    <Link
                        href={`/dashboard/${slug}/editor`}
                        className="flex items-center gap-2 px-5 py-2 bg-primary text-black rounded-xl shadow-[0_10px_20px_rgba(254,117,1,0.2)] hover:scale-105 active:scale-95 transition-all text-[11px] font-black uppercase tracking-widest"
                    >
                        <Palette className="w-3.5 h-3.5 fill-current" />
                        Personnaliser
                    </Link>
                </div>
            </div>

            {/* Stats Grid Compact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Package className="w-4 h-4" />}
                    label="Produits"
                    value={productCount?.toString() || "0"}
                    change="+100%"
                    positive
                />
                <StatCard
                    icon={<ShoppingCart className="w-4 h-4" />}
                    label="Ventes (30J)"
                    value={totalSales.toString()}
                    change={`${salesGrowth >= 0 ? '+' : ''}${salesGrowth}%`}
                    positive={salesGrowth >= 0}
                />
                <StatCard
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Revenus (30J)"
                    value={formatPrice(totalRevenue, storeCurrency)}
                    change={`${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}%`}
                    positive={revenueGrowth >= 0}
                />
                <StatCard
                    icon={<Users className="w-4 h-4" />}
                    label="Empire Aura"
                    value="VIP"
                    change="Elite"
                    positive
                />
            </div>

            {/* AI Intelligence: Dynamic Sales & Strategic Advice */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <SalesChart data={dailySales} predictions={futureSales} currency={storeCurrency} />
                </div>
                <div className="xl:col-span-1 h-full flex">
                    <AiAcquisitionAdvice storeName={store.name} ordersData={currentOrders} />
                </div>
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Recent Products */}
                <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-8 space-y-6 border border-white/[0.03] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                        <Package className="w-24 h-24 text-white" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <h3 className="font-display font-black text-sm uppercase tracking-widest text-white/60">Produits Récents</h3>
                        <Link href={`/dashboard/${slug}/products`} className="text-[10px] font-black text-primary hover:text-accent uppercase tracking-widest transition-colors flex items-center gap-2">
                            Gestion Stock <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentProducts && recentProducts.length > 0 ? (
                            recentProducts.map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-[1.5rem] hover:bg-white/[0.04] hover:border-white/10 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-white/5 relative">
                                            <img
                                                src={p.images?.[0] || "/placeholder-product.png"}
                                                alt={p.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-white group-hover:text-primary transition-colors">{p.name}</p>
                                            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">{p.category || "Standard Aura"}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-white">{formatPrice(p.price, storeCurrency)}</p>
                                        <p className={`text-[9px] font-black uppercase tracking-tighter mt-1 ${p.stock > 0 ? 'text-emerald-500/60' : 'text-rose-500/60'}`}>
                                            {p.stock > 0 ? `${p.stock} unités` : 'Rupture'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 rounded-2xl bg-white/[0.01] border border-dashed border-white/5 group hover:border-primary/20 transition-colors">
                                <Package className="w-8 h-8 mx-auto mb-3 text-white/5 group-hover:text-primary/20 transition-colors" />
                                <p className="text-white/20 text-[11px] font-bold uppercase tracking-wider mb-4">La boutique est vide</p>
                                <Link
                                    href={`/dashboard/${slug}/products/new`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/60 transition-all"
                                >
                                    Ajouter mon premier article
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-5">
                    {/* Activity Feed Aura */}
                    <div className="glass-card rounded-[2rem] p-6 space-y-5 border border-white/[0.03] relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display font-black text-sm uppercase tracking-widest text-white/80">Flux d'Activité</h3>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                        </div>

                        <div className="space-y-4">
                            {recentOrders && recentOrders.length > 0 ? (
                                recentOrders.map((order) => (
                                    <div key={order.id} className="flex gap-3 group/item">
                                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 group-hover/item:border-primary/30 transition-colors">
                                            <ShoppingCart className="w-3.5 h-3.5 text-white/20 group-hover/item:text-primary transition-colors" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-black text-white/80 uppercase tracking-tight line-clamp-1">{order.customer_name}</p>
                                            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">
                                                {formatPrice(order.total, storeCurrency)} • {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest text-center py-4 italic">Aucun flux récent</p>
                            )}
                        </div>

                        <Link
                            href={`/dashboard/${slug}/orders`}
                            className="block w-full text-center py-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-white/40 transition-all"
                        >
                            Visionner les Commandes
                        </Link>
                    </div>

                    {/* Store Status Elite */}
                    <div className="glass-card rounded-[2rem] p-6 space-y-5 border border-white/[0.03] relative overflow-hidden group/status">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -rotate-45 translate-x-12 -translate-y-12" />
                        <h3 className="font-display font-black text-sm uppercase tracking-widest text-white/80">Statut Système</h3>

                        <div className="space-y-3">
                            <StatusItem
                                label="Visibilité"
                                value={store.is_active ? "Public" : "Privé"}
                                status={store.is_active ? "success" : "warning"}
                            />
                            <StatusItem
                                label="Thème"
                                value={(store.theme_config as any)?.name || "Volcanic Luxe"}
                                status="info"
                            />
                            <StatusItem
                                label="Mode"
                                value="Elite"
                                status="info"
                            />
                        </div>

                        <div className="pt-4 border-t border-white/[0.05] space-y-2.5">
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Configuration</p>
                            <SetupStep active done label="Boutique créée" />
                            <SetupStep active={!!(productCount && productCount > 0)} done={!!(productCount && productCount > 0)} label="Ajouter un produit" />
                            <SetupStep label="Connecter domaine" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    change,
    positive,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    change: string;
    positive: boolean;
}) {
    return (
        <div className="glass-card rounded-2xl p-5 space-y-4 border border-white/[0.03] hover:border-white/10 transition-all group">
            <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-white/[0.03] group-hover:bg-primary/10 flex items-center justify-center text-white/40 group-hover:text-primary transition-all">
                    {icon}
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-md ${positive ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10"}`}>
                    {change}
                </span>
            </div>
            <div>
                <p className="text-xl font-black text-white font-display tracking-tight">{value}</p>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.15em]">{label}</p>
            </div>
        </div>
    );
}

function StatusItem({
    label,
    value,
    status
}: {
    label: string;
    value: string;
    status: "success" | "warning" | "info"
}) {
    const colors = {
        success: "text-green-500 bg-green-500/10",
        warning: "text-orange-500 bg-orange-500/10",
        info: "text-primary bg-primary/10",
    };

    return (
        <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-tight">{label}</span>
            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${colors[status]}`}>
                {value}
            </span>
        </div>
    );
}

function SetupStep({ label, done = false, active = false }: { label: string, done?: boolean, active?: boolean }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${done ? "bg-green-500/20 text-green-500 border border-green-500/20" :
                active ? "bg-primary/20 text-primary border border-primary/20" :
                    "bg-white/5 text-white/20 border border-white/5"
                }`}>
                {done ? "✓" : "!"}
            </div>
            <span className={`text-[11px] font-bold transition-colors ${active || done ? "text-white/60" : "text-white/20"}`}>
                {label}
            </span>
        </div>
    );
}
