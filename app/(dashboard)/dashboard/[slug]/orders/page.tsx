import { ShoppingCart, Package, Search, Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { OrderTableClient } from "@/components/dashboard/order-table-client";

export default async function OrdersPage({ params }: { params: { slug: string } }) {
    const supabase = createClient();

    // Fetch store
    const { data: store } = await supabase
        .from("stores")
        .select("id, name")
        .eq("slug", params.slug)
        .single();

    if (!store) return notFound();

    // Fetch orders
    const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6 pt-16 scale-[0.98] transform-gpu">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">Commerce</p>
                    <h1 className="font-display text-3xl font-black text-white">
                        Commandes
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                        <input
                            type="text"
                            placeholder="Rechercher une commande..."
                            className="pl-9 pr-4 py-2 bg-white/[0.03] border border-white/[0.05] rounded-xl text-[11px] text-white focus:outline-none focus:border-primary/30 transition-all font-bold w-64"
                        />
                    </div>
                    <button className="p-2 bg-white/[0.03] border border-white/[0.05] rounded-xl hover:bg-white/[0.06] transition-all">
                        <Filter className="w-4 h-4 text-white/40" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="glass-card rounded-[2rem] border border-white/[0.03] overflow-hidden">
                {!orders || orders.length === 0 ? (
                    <div className="p-12 text-center space-y-6">
                        <div className="w-20 h-20 mx-auto rounded-3xl bg-white/[0.02] flex items-center justify-center border border-white/5">
                            <ShoppingCart className="w-8 h-8 text-white/10" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="font-display text-xl font-bold text-white/80">Aucune commande pour le moment</h2>
                            <p className="text-white/30 text-xs max-w-sm mx-auto uppercase tracking-wider font-bold">
                                Vos ventes apparaîtront ici dès que vos clients commenceront à commander.
                            </p>
                        </div>
                    </div>
                ) : (
                    <OrderTableClient orders={orders} storeSlug={params.slug} storeName={store.name} />
                )}

                {/* Table Footer */}
                <div className="px-6 py-4 bg-white/[0.01] border-t border-white/[0.03] flex items-center justify-between">
                    <span className="text-[9px] font-black tracking-[0.2em] text-white/20 uppercase">AuraStore Commandes x Intelligent Assistant</span>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-white/5" />
                        <div className="w-2 h-2 rounded-full bg-white/5" />
                        <div className="w-2 h-2 rounded-full bg-white/5" />
                    </div>
                </div>
            </div>
        </div>
    );
}
