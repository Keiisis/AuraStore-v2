"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, Zap, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Scene3D } from "@/components/effects/scene-3d";
import type { FrontendConfig } from "@/lib/actions/frontend";

interface LandingHeroProps {
    config: FrontendConfig;
}

export function LandingHero({ config }: LandingHeroProps) {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 150]);
    const rotate = useTransform(scrollY, [0, 500], [0, 3]);

    return (
        <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-[90vh] flex items-center bg-transparent">
            {/* Immersive 3D Space */}
            <Scene3D />

            {/* Scale-down effect on the whole content for 'zoom out' feel */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 scale-95 md:scale-100">
                {/* Text Content */}
                <div className="space-y-8 relative">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-[0.25em] text-primary"
                    >
                        <Zap className="w-2.5 h-2.5 fill-primary" />
                        {config.brand_name ? `MAITRISEZ ${config.brand_name.toUpperCase()}` : "LA PLATEFORME #1 EN AFRIQUE"}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="font-display text-5xl md:text-7xl font-black tracking-tight leading-[0.9] text-white"
                    >
                        {config.hero_title || (
                            <>
                                Créez votre <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                                    boutique IA <br /> & immersive
                                </span> <br />
                                en 30 secondes.
                            </>
                        )}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-base md:text-lg text-white/50 max-w-md font-medium leading-relaxed whitespace-pre-wrap"
                    >
                        {config.hero_subtitle || 'AuraStore transforme vos visiteurs en acheteurs grâce à l\'essayage virtuel et une UX "God Mode". Zéro code. Zéro friction.'}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-wrap items-center gap-6"
                    >
                        <Link href="/login?signup=true">
                            <button className="group relative flex items-center gap-3 px-7 py-3.5 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.05)]">
                                <span>{config.hero_cta_primary || "Commencer gratuitement"}</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>

                        <button className="flex items-center gap-3 px-6 py-4 text-white/60 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest group">
                            <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                                <Play className="w-3 h-3 fill-current ml-0.5" />
                            </div>
                            <span>{config.hero_cta_secondary || "Voir la démo"}</span>
                        </button>
                    </motion.div>

                    {/* Trust Badges */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="flex items-center gap-6 pt-6 overflow-hidden grayscale opacity-20"
                    >
                        <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
                            <Shield className="w-3 h-3" />
                            Aucune carte
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <div className="text-[9px] font-black tracking-widest uppercase">
                            Prêt en 5 min
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <div className="text-[9px] font-black tracking-widest uppercase">
                            Privacy-first
                        </div>
                    </motion.div>
                </div>

                {/* iPhone Mockup */}
                <motion.div
                    style={{ y: y1, rotate }}
                    initial={{ opacity: 0, scale: 0.7, rotate: -3 }}
                    animate={{ opacity: 1, scale: 0.9, rotate: 0 }}
                    transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                    className="relative hidden lg:block"
                >
                    <div className="relative w-[300px] h-[610px] mx-auto bg-black rounded-[3rem] border-[10px] border-[#121212] shadow-[0_50px_100px_rgba(0,0,0,0.6)] overflow-hidden">
                        <div className="absolute top-8 left-0 right-0 p-4 flex items-center justify-between z-20">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[8px] font-black text-green-400 uppercase tracking-tighter">Aura Engine</span>
                            </div>
                        </div>

                        <div className="w-full h-full relative overflow-hidden bg-[#08080A]">
                            <Image
                                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"
                                alt="Shop Preview"
                                fill
                                className="object-cover opacity-90"
                            />
                            <div className="absolute bottom-8 left-5 right-5 p-3.5 rounded-xl bg-black/40 backdrop-blur-3xl border border-white/5 space-y-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">Match</p>
                                        <p className="text-sm font-black text-white">98%</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">Rendu</p>
                                        <p className="text-sm font-black text-primary">ULTRA HD</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-12 top-1/4 p-3 rounded-xl bg-[#121216]/80 backdrop-blur-2xl border border-white/5 flex items-center gap-2 shadow-2xl"
                    >
                        <div className="p-1.5 rounded-lg bg-primary/10">
                            <Zap className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">AI ACTIVE</span>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
