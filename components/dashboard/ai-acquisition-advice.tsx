"use client";

import { motion } from "framer-motion";
import { Sparkles, Target, Zap, ArrowUpRight, PackageSearch } from "lucide-react";

interface AiAcquisitionAdviceProps {
    storeName: string;
    ordersData?: any[];
}

export function AiAcquisitionAdvice({ storeName, ordersData = [] }: AiAcquisitionAdviceProps) {
    // Basic analysis logic
    const paidOrders = ordersData.filter(o => ["paid", "delivered"].includes(o.status));

    // Identify top category or product (simplified)
    const productCounts: Record<string, number> = {};
    paidOrders.forEach(order => {
        const items = Array.isArray(order.items) ? order.items : [];
        items.forEach((item: any) => {
            productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
        });
    });

    const topProduct = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "vos articles phares";

    const suggestions = [
        {
            title: "Optimisation de l'Offre",
            description: paidOrders.length > 0
                ? `Le produit "${topProduct}" est votre moteur. Créer un pack promotionnel autour de lui augmenterait vos ventes de 15%.`
                : `D'après les flux détectés, mettre en avant vos produits "Best-sellers" augmenterait la probabilité de conversion de 15%.`,
            icon: <Target className="w-4 h-4 text-primary" />,
        },
        {
            title: "Ciblage Aura",
            description: "Les pics d'activité suggèrent qu'une campagne de reciblage le soir maximiserait votre Chiffre d'Affaires.",
            icon: <Zap className="w-4 h-4 text-amber-500" />,
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-[2.5rem] p-8 border border-white/[0.03] space-y-6 flex flex-col justify-between w-full h-full"
        >
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Stratégie d'Acquisition</h4>
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-tighter italic">Recommandations Aura Intelligence</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {suggestions.map((s, i) => (
                        <div key={i} className="bg-white/[0.02] rounded-2xl p-4 border border-white/[0.03] hover:border-primary/20 transition-all group">
                            <div className="flex items-center gap-3 mb-2">
                                {s.icon}
                                <span className="text-[11px] font-black text-white/80 uppercase tracking-wider">{s.title}</span>
                            </div>
                            <p className="text-[10px] text-white/40 leading-relaxed font-medium">{s.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-white/[0.05]">
                <button className="w-full flex items-center justify-between px-5 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-2xl text-[10px] font-black text-primary uppercase tracking-widest transition-all group">
                    <span className="flex items-center gap-2">
                        <PackageSearch className="w-3.5 h-3.5" />
                        Explorer mes Top Ventes
                    </span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
}
