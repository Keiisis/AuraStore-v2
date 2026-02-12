"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Plus, Sparkles, Smartphone, Monitor, Check, ArrowRight, Layers, Zap } from "lucide-react";

interface Theme {
    id: string;
    name: string;
    description: string;
    slug: string;
    image_url: string;
    colors: string[];
}

export function LandingShowcase() {
    const [activeTheme, setActiveTheme] = useState(0);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fallback: Theme[] = [
        { id: '1', name: "Volcanic Luxe", description: "Identité sombre et brute, contrastes néons pour streetwear.", slug: "streetwear", image_url: "https://images.unsplash.com/photo-1523398384497-b7330222f716", colors: ["#0A0A0A", "#FF4D00", "#FFFFFF"] },
        { id: '2', name: "Emerald Night", description: "Émeraudes et dorures valorisant l'héritage traditionnel.", slug: "traditionnel", image_url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482", colors: ["#064e3b", "#f59e0b", "#fef3c7"] },
        { id: '3', name: "Cyber Orchid", description: "Futuriste, vibrant, pour les produits digitaux et cosmétiques.", slug: "cyber-orchid", image_url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853", colors: ["#2e1065", "#d946ef", "#00ffff"] },
        { id: '4', name: "Sneakers Hub", description: "Vibrant, énergique, typographie audacieuse pour collectionneurs.", slug: "sneakers", image_url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa", colors: ["#000000", "#ef4444", "#ffffff"] },
        { id: '5', name: "Bijoux & Or", description: "Minimalisme épuré, teintes crème et reflets métalliques.", slug: "bijoux", image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338", colors: ["#fafaf9", "#d4af37", "#1c1917"] },
        { id: '6', name: "Maroquinerie", description: "Cuirs profonds, ambiances terreuses et élégance intemporelle.", slug: "sacs", image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa", colors: ["#1c1917", "#78350f", "#fef3c7"] },
        { id: '7', name: "Accessoires Mode", description: "Palette équilibrée et moderne pour petits objets de luxe.", slug: "accessoires", image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3", colors: ["#0c0a09", "#8b5cf6", "#fafaf9"] },
        { id: '8', name: "Y2K Retro", description: "Acid colors, chrome et esthétique futuriste des années 2000.", slug: "y2k", image_url: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400", colors: ["#2e1065", "#d946ef", "#00ffff"] },
        { id: '9', name: "Techwear Future", description: "Cyberpunk, noir profond et bleus électriques pour la tech.", slug: "techwear", image_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f", colors: ["#050505", "#00F0FF", "#180C2E"] },
        { id: '10', name: "Design Minimalist", description: "Noir et blanc absolu, focalisation sur le produit.", slug: "minimalist", image_url: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85", colors: ["#ffffff", "#000000", "#71717a"] }
    ];

    useEffect(() => {
        setIsLoading(true);
        fetch("/api/themes")
            .then(res => res.json())
            .then(data => {
                const apiThemes = data.themes || [];
                // Use the 10 fallback slots as the strict structure
                // Inject API data into slots where the slug or name matches
                const strictlyTen = fallback.map(f => {
                    const fromDb = apiThemes.find((t: any) => t.slug === f.slug || t.name === f.name);
                    return fromDb ? { ...f, ...fromDb } : f;
                });
                setThemes(strictlyTen);
            })
            .catch(() => setThemes(fallback))
            .finally(() => setIsLoading(false));
    }, []);

    const activeThemeData = themes[activeTheme] || fallback[activeTheme];

    return (
        <section id="themes" className="py-24 md:py-32 relative overflow-hidden">
            {/* Ultra Intelligent Background */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_70%)] opacity-50" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />
                {/* Rotating accent aura */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary/5 rounded-full blur-3xl opacity-20"
                />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6 max-w-3xl"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                            <Zap className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Smart Visual Engine v4.0</span>
                        </div>
                        <h2 className="text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-[0.9]">
                            10 Identités <br />
                            <span className="text-transparent border-t-text-white bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Visuelles</span>
                        </h2>
                        <p className="text-xl text-white/40 font-medium max-w-xl leading-relaxed">
                            Chaque catégorie possède son propre <span className="text-white">ADN visuel</span>. Propulsez votre marque avec des thématiques conçues pour convertir.
                        </p>
                    </motion.div>

                    <div className="hidden md:flex gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl">
                            <Layers className="w-6 h-6 text-primary mb-2" />
                            <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Centralisation Totale</div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-16 items-start">
                    {/* Leftside: The Strict 10 List */}
                    <div className="lg:col-span-4 space-y-4 max-h-[750px] overflow-y-auto pr-4 scrollbar-hide">
                        {themes.map((theme, idx) => (
                            <button
                                key={theme.id || idx}
                                onClick={() => setActiveTheme(idx)}
                                className={`w-full relative group transition-all duration-500 rounded-[2rem] overflow-hidden ${activeTheme === idx ? "scale-105" : "hover:scale-[1.02]"
                                    }`}
                            >
                                <div className={`absolute inset-0 transition-opacity duration-500 ${activeTheme === idx ? "opacity-100" : "opacity-0"
                                    }`} style={{ background: `linear-gradient(90deg, ${theme.colors[1]}20, transparent)` }} />

                                <div className={`p-6 border transition-all duration-500 relative flex items-center justify-between ${activeTheme === idx
                                    ? "bg-white/5 border-primary/40 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                                    : "bg-transparent border-white/5 hover:border-white/10"
                                    }`}>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-black italic tracking-widest uppercase transition-colors ${activeTheme === idx ? "text-primary" : "text-white/30"
                                                }`}>
                                                Identity {idx + 1 < 10 ? '0' : ''}{idx + 1}
                                            </span>
                                            {activeTheme === idx && (
                                                <motion.div layoutId="active-dot" className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            )}
                                        </div>
                                        <h3 className={`text-2xl font-black uppercase italic tracking-tighter transition-all ${activeTheme === idx ? "text-white translate-x-1" : "text-white/40 group-hover:text-white/60"
                                            }`}>
                                            {theme.name}
                                        </h3>
                                    </div>

                                    <div className="flex -space-x-2">
                                        {(theme.colors || []).slice(0, 3).map((c, i) => (
                                            <div
                                                key={i}
                                                className="w-8 h-8 rounded-full border-4 border-[#050505] shadow-xl"
                                                style={{ backgroundColor: c, zIndex: 3 - i }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Rightside: Badass Dual-Device Preview */}
                    <div className="lg:col-span-8 relative h-[800px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTheme}
                                initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                exit={{ opacity: 0, scale: 1.1, rotateY: -10 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="relative w-full h-full flex items-center justify-center perspective-[2000px]"
                            >
                                {/* DESKTOP SCREEN (Behind) */}
                                <motion.div
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 1 }}
                                    className="absolute md:right-0 top-1/2 -translate-y-1/2 w-[110%] md:w-[85%] aspect-video bg-[#0A0A0C] rounded-[2rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden hidden md:block"
                                >
                                    {/* Browser Header */}
                                    <div className="h-10 px-6 flex items-center gap-4 bg-white/[0.03] border-b border-white/5">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-red-500/20" />
                                            <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                                            <div className="w-2 h-2 rounded-full bg-green-500/20" />
                                        </div>
                                        <div className="flex-1 max-w-sm h-5 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center">
                                            <span className="text-[7px] text-white/20 font-black uppercase tracking-widest">{activeThemeData.slug}.aurastore.app</span>
                                        </div>
                                    </div>

                                    {/* Desktop Content Preview */}
                                    <div className="relative w-full h-full bg-black overflow-hidden">
                                        <Image
                                            src={activeThemeData.image_url}
                                            fill
                                            className="object-cover opacity-60 transition-transform duration-[3s]"
                                            alt="Desktop Preview"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                                        <div className="absolute top-1/4 left-12 space-y-6 text-left">
                                            <div className="px-3 py-1 bg-primary/20 border border-primary/20 rounded-full inline-block">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-primary">Nouveau Theme Pack</span>
                                            </div>
                                            <h4 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
                                                Identity <br /> {activeThemeData.name}
                                            </h4>
                                            <p className="text-sm text-white/40 max-w-sm font-medium">
                                                {activeThemeData.description}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* SMARTPHONE (In Front) */}
                                <motion.div
                                    initial={{ x: -100, opacity: 0, rotate: -5 }}
                                    animate={{ x: -80, opacity: 1, rotate: 0 }}
                                    transition={{ delay: 0.4, duration: 1, type: "spring", stiffness: 50 }}
                                    className="absolute left-1/2 md:left-24 bottom-12 md:bottom-20 z-30 w-72 h-[580px] bg-[#050505] rounded-[3.5rem] border-[10px] border-[#1a1a1a] shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden ring-1 ring-white/10"
                                >
                                    {/* Notch */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#1a1a1a] rounded-b-3xl z-40 flex items-center justify-center">
                                        <div className="w-12 h-1 bg-white/5 rounded-full" />
                                    </div>

                                    {/* Mobile UI Preview */}
                                    <div className="relative w-full h-full flex flex-col bg-black">
                                        {/* Mobile Navbar */}
                                        <div className="h-16 px-6 flex items-center justify-between bg-black/80 backdrop-blur-xl border-b border-white/5 mt-4">
                                            <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: activeThemeData.colors[1] }} />
                                            <div className="flex gap-2">
                                                <div className="w-8 h-1 bg-white/10 rounded-full" />
                                                <div className="w-8 h-1 bg-white/10 rounded-full" />
                                            </div>
                                        </div>

                                        {/* Mobile Content */}
                                        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-8 p-6">
                                            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden group">
                                                <Image src={activeThemeData.image_url} fill className="object-cover" alt="Mobile Hero" priority />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                                                <div className="absolute bottom-6 left-6 text-left">
                                                    <h5 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">
                                                        DROP <br /> EXCLUSIF
                                                    </h5>
                                                    <div className="px-6 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest inline-block transition-transform active:scale-95" style={{ backgroundColor: activeThemeData.colors[1], color: '#000' }}>
                                                        Commander
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Smart Features */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-left">
                                                    <Sparkles className="w-4 h-4 mb-2" style={{ color: activeThemeData.colors[1] }} />
                                                    <p className="text-[7px] font-black text-white/40 uppercase tracking-widest">Aura VTO</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-left">
                                                    < Zap className="w-4 h-4 mb-2" style={{ color: activeThemeData.colors[2] || activeThemeData.colors[1] }} />
                                                    <p className="text-[7px] font-black text-white/40 uppercase tracking-widest">Fast Checkout</p>
                                                </div>
                                            </div>

                                            {/* Product Item */}
                                            <div className="space-y-3 pt-2 text-left">
                                                <div className="aspect-square rounded-3xl bg-white/5 border border-white/5 relative" />
                                                <div className="h-2 w-full bg-white/10 rounded-full" />
                                                <div className="h-3 w-1/3 rounded-full" style={{ backgroundColor: activeThemeData.colors[1] }} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Background Glitch/Scanline effect */}
                                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-40 bg-[length:100%_2px,3px_100%]" />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}
