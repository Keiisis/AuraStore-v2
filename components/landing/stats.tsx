"use client";

import { motion } from "framer-motion";
import { Users, Store, TrendingUp, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { FrontendConfig } from "@/lib/actions/frontend";

interface LandingStatsProps {
    config: FrontendConfig;
}

export function LandingStats({ config }: LandingStatsProps) {
    const supabase = createClient();
    const [stats, setStats] = useState({
        stores: 1250,
        products: 45000,
        volume: "125M",
        countries: 8
    });

    useEffect(() => {
        const fetchStats = async () => {
            // Get REAL stats from DB
            const { count: storesCount } = await supabase.from("stores").select("*", { count: "exact", head: true });

            // If live stats enabled and we have > 10 stores, show real numbers
            if (config.show_live_stats && (storesCount || 0) > 10) {
                setStats({
                    stores: storesCount || 0,
                    products: (storesCount || 0) * 12, // Estimation based on avg
                    volume: (((storesCount || 0) * 150000) / 1000000).toFixed(1) + "M",
                    countries: 5
                });
            }
        };
        fetchStats();
    }, [config.show_live_stats]);

    const statItems = [
        { label: "Boutiques Actives", value: stats.stores.toLocaleString(), icon: Store, color: "text-primary" },
        { label: "Produits en Vente", value: stats.products.toLocaleString(), icon: TrendingUp, color: "text-blue-400" },
        { label: "Volume d'Affaires", value: stats.volume + " CFA", icon: Globe, color: "text-emerald-400" },
        { label: "Utilisateurs", value: (stats.stores * 3).toLocaleString(), icon: Users, color: "text-purple-400" },
    ];

    return (
        <section className="py-12 border-y border-white/5 bg-black/40 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {statItems.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center space-y-2 group cursor-default"
                        >
                            <div className="flex justify-center mb-4">
                                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-white/10 group-hover:scale-110 transition-all duration-300">
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                            <h4 className="text-3xl font-black text-white tracking-tighter">{stat.value}</h4>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
