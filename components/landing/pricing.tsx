"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Target, Crown, Star, Shield, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

const ICON_MAP: Record<string, any> = { Zap, Target, Crown, Star, Shield };

interface Plan {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    is_custom_price: boolean;
    icon_name: string;
    accent_color: string;
    is_popular: boolean;
    features_list: string[];
}

export function LandingPricing() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/plans")
            .then(res => res.json())
            .then(data => {
                setPlans(data.plans || []);
                setLoading(false);
            })
            .catch(() => {
                // Fallback static plans if API fails
                setPlans([
                    { id: "1", name: "Starter", slug: "starter", description: "Pour tester l'impact IA", price: 9900, is_custom_price: false, icon_name: "Zap", accent_color: "white", is_popular: false, features_list: ["1 boutique active", "Aura Sync (10 photos/mois)", "Ventes WhatsApp illimitées", "Support email"] },
                    { id: "2", name: "Pro", slug: "pro", description: "L'outil des boutiques d'élite", price: 24900, is_custom_price: false, icon_name: "Target", accent_color: "primary", is_popular: true, features_list: ["3 boutiques actives", "Aura Sync illimité", "Viral Content Hub", "Analytics Premium", "SEO Opti IA"] },
                    { id: "3", name: "Empire", slug: "empire", description: "Solutions sur mesure", price: 0, is_custom_price: true, icon_name: "Crown", accent_color: "accent", is_popular: false, features_list: ["Boutiques illimitées", "API Custom", "Virtual Try-On 3D", "Account Manager dédié", "Multi-comptes Admin"] },
                ]);
                setLoading(false);
            });
    }, []);

    return (
        <section id="tarifs" className="py-24 px-6 relative bg-transparent">
            <div className="max-w-7xl mx-auto space-y-20 scale-[0.96]">
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[9px] font-black tracking-[0.4em] text-primary uppercase"
                    >
                        Tarification
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="font-display text-4xl md:text-5xl font-black text-white leading-tight"
                    >
                        Investissez dans votre <br />
                        <span className="italic">croissance exponentielle.</span>
                    </motion.h2>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, idx) => {
                            const IconComp = ICON_MAP[plan.icon_name] || Zap;
                            const isPop = plan.is_popular;
                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`relative group rounded-[2.5rem] p-10 bg-[#121216]/40 border transition-all duration-500 overflow-hidden ${isPop
                                        ? 'border-primary/20 ring-1 ring-primary/20 bg-[#121216]/60'
                                        : 'border-white/[0.03]'
                                        }`}
                                >
                                    {/* Glow effect on hover */}
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${isPop ? 'bg-primary/[0.02]' : 'bg-white/[0.01]'}`} />

                                    {isPop && (
                                        <div className="absolute top-8 right-8 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-[9px] font-black text-primary uppercase tracking-widest">
                                            Populaire
                                        </div>
                                    )}

                                    <div className="space-y-8 relative z-10">
                                        <div className="space-y-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${isPop ? 'bg-primary/10 border-primary/10' : 'bg-white/10 border-white/10'}`}>
                                                <IconComp className={`w-6 h-6 ${isPop ? 'text-primary' : 'text-white/60'}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-display font-black text-2xl text-white">{plan.name}</h3>
                                                <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">{plan.description}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-baseline gap-1">
                                            {plan.is_custom_price ? (
                                                <span className="text-4xl font-black text-white">Sur devis</span>
                                            ) : (
                                                <>
                                                    <span className="text-4xl font-black text-white">{plan.price.toLocaleString()}</span>
                                                    <span className="text-xs font-bold text-white/30 tracking-widest uppercase">FCFA/mois</span>
                                                </>
                                            )}
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-white/[0.03]">
                                            {plan.features_list.map((f: string) => (
                                                <div key={f} className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isPop ? 'bg-primary/10' : 'bg-white/10'}`}>
                                                        <Check className={`w-3 h-3 ${isPop ? 'text-primary' : 'text-white/60'}`} />
                                                    </div>
                                                    <span className="text-[11px] font-medium text-white/50">{f}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <Link href={`/login?plan=${plan.slug}`} className="block pt-4">
                                            <button className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 group/btn ${isPop
                                                ? 'bg-primary text-black hover:scale-[1.02] shadow-xl shadow-primary/20'
                                                : 'bg-white/[0.03] text-white border border-white/5 hover:bg-white/10'
                                                }`}>
                                                Sélectionner
                                                <ArrowRight className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                                            </button>
                                        </Link>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
