"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Cpu, Share2, MessageSquare, BarChart3, Palette, ShieldCheck } from "lucide-react";

const features = [
    { icon: Cpu, title: "Aura Sync IA", description: "L'IA analyse l'éclairage de la photo du client et adapte le rendu." },
    { icon: Share2, title: "Viral Content Hub", description: "Génération auto de contenu partageable pour TikTok/Insta." },
    { icon: MessageSquare, title: "WhatsApp Checkout", description: "Tunnel le plus court : de l'essayage à WhatsApp en 1 clic." },
    { icon: BarChart3, title: "Analytics Premium", description: "Suivez vues et essayages en temps réel." },
    { icon: Palette, title: "10 Thèmes Dynamiques", description: "Chaque catégorie possède son ADN visuel unique." },
    { icon: ShieldCheck, title: "Privacy First", description: "Zéro compte client. Photos supprimées automatiquement." },
];

export function LandingFeatures() {
    return (
        <section id="technologie" className="py-24 px-6 relative bg-transparent">
            <div className="max-w-7xl mx-auto space-y-20 scale-[0.98]">
                <div className="space-y-4 max-w-2xl">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[9px] font-black tracking-[0.4em] text-primary uppercase"
                    >
                        Technologie Aura
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-display text-4xl md:text-5xl font-black text-white leading-tight"
                    >
                        Chaque fonctionnalité est un <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-glow">avantage compétitif.</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className="group p-8 rounded-[2.5rem] bg-[#121216]/40 border border-white/[0.03] hover:border-primary/20 transition-all duration-500 relative overflow-hidden"
                        >
                            <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10 space-y-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-5 h-5 text-primary" />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-primary" />
                                        <h3 className="font-display font-bold text-lg text-white group-hover:text-primary transition-colors">{feature.title}</h3>
                                    </div>
                                    <p className="text-white/40 leading-relaxed text-xs font-medium max-w-[240px]">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
