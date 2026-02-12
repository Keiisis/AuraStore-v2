"use client";

import { motion } from "framer-motion";
import { BlockConfig } from "@/lib/theme-engine/types";
import { Store } from "@/lib/supabase/types";
import Image from "next/image";

interface ImageBannerProps {
    config: BlockConfig;
    store: Store; // We pass the store directly for branding
}

export function ImageBanner({ config, store }: ImageBannerProps) {
    const bannerUrl = store.banner_url || (config.props as any).backgroundImage;

    return (
        <section className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] min-h-[300px] overflow-hidden">
            {/* Immersive 3D-like Parallax Background */}
            <motion.div
                className="absolute inset-0 scale-110"
                initial={{ scale: 1.2, filter: 'blur(10px) brightness(0.5)' }}
                animate={{ scale: 1.05, filter: 'blur(0px) brightness(0.7)' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            >
                {bannerUrl ? (
                    <Image
                        src={bannerUrl}
                        alt={store.name}
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-[var(--theme-surface,#121216)]" />
                )}

                {/* Volcanic Luxe Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-background,#08080A)] via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-background,#08080A)]/60 via-transparent to-transparent" />

                {/* Animated Particles/Dust Overlay */}
                <div className="absolute inset-0 opacity-20 mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')] animate-pulse" />
            </motion.div>

            {/* Content Container */}
            <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-end pb-12 md:pb-20">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="space-y-4 md:space-y-6"
                >
                    {/* Floating Store Badge */}
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
                        <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Boutique Officielle</span>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] leading-tight">
                            {store.name}
                        </h1>
                        <p className="max-w-xl text-white/50 text-sm md:text-base font-medium leading-relaxed drop-shadow-md">
                            {store.description || "Une expérience de vente unique proposée par AuraStore."}
                        </p>
                    </div>

                    {/* Quick Stats or Features */}
                    <div className="flex flex-wrap gap-4 md:gap-8 pt-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-primary font-black">Livraison</span>
                            <span className="text-sm font-bold text-white">Express / 24h</span>
                        </div>
                        <div className="w-px h-8 bg-white/10 hidden md:block" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-primary font-black">Paiement</span>
                            <span className="text-sm font-bold text-white">Sécurisé & Mobile</span>
                        </div>
                        <div className="w-px h-8 bg-white/10 hidden md:block" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-primary font-black">Support</span>
                            <span className="text-sm font-bold text-white">WhatsApp 24/7</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* 3D Glass Ornament */}
            <motion.div
                className="absolute top-1/2 right-10 w-64 h-64 bg-primary/10 blur-[100px] rounded-full"
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, -50, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
        </section>
    );
}
