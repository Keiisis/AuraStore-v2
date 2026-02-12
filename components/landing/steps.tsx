"use client";

import { motion } from "framer-motion";
import { UserPlus, Settings, Rocket } from "lucide-react";

const steps = [
    {
        icon: UserPlus,
        step: "01",
        title: "Connexion Kage",
        description: "Inscrivez-vous et recevez vos accès vendeurs immédiatement."
    },
    {
        icon: Settings,
        step: "02",
        title: "Configuration IA",
        description: "Choisissez votre univers et l'IA synchronise vos produits."
    },
    {
        icon: Rocket,
        step: "03",
        title: "Partagez & Vendez",
        description: "Diffusez votre lien et vendez via WhatsApp en automatique."
    }
];

export function LandingSteps() {
    return (
        <section id="fonctionnement" className="py-24 px-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-20 scale-[0.96]">
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <p className="text-[9px] font-black tracking-[0.4em] text-primary uppercase">Protocole</p>
                    <h2 className="font-display text-4xl md:text-5xl font-black text-white">
                        Prêt pour le <span className="text-primary italic">décollage.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Floating Connector Line */}
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-y-1/2 z-0" />

                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative z-10 group"
                        >
                            <div className="text-center space-y-6">
                                <div className="relative mx-auto w-20 h-20 rounded-[2rem] bg-[#121216] border border-white/[0.05] flex items-center justify-center group-hover:border-primary/30 transition-all duration-500 overflow-hidden">
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <step.icon className="w-8 h-8 text-white/20 group-hover:text-primary group-hover:scale-110 transition-all" />
                                </div>

                                <div className="space-y-3">
                                    <span className="text-[10px] font-black text-primary tracking-[0.3em]">{step.step}</span>
                                    <h3 className="font-display font-bold text-xl text-white">{step.title}</h3>
                                    <p className="text-white/40 leading-relaxed text-xs font-medium max-w-[200px] mx-auto">
                                        {step.description}
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
