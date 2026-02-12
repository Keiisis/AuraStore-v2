"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Menu, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FrontendConfig } from "@/lib/actions/frontend";

interface LandingHeaderProps {
    config: FrontendConfig;
}

export function LandingHeader({ config }: LandingHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Accueil" },
        { href: "/#technologie", label: "Fonctionnalités", active: config.show_features },
        { href: "/#themes", label: "Showcase", active: config.show_themes },
        { href: "/#tarifs", label: "Tarifs", active: config.show_pricing },
    ].filter(l => l.active !== false);

    return (
        <header className="fixed top-0 left-0 right-0 h-20 bg-black/50 backdrop-blur-xl border-b border-white/5 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

                {/* Brand */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-emerald-500 to-emerald-900 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                        {config.logo_url ? (
                            <img src={config.logo_url} alt="Logo" className="w-6 h-6 object-contain" />
                        ) : (
                            <div className="w-4 h-4 bg-black rotate-45" />
                        )}
                    </div>
                    <span
                        className="text-xl font-black italic tracking-tighter uppercase group-hover:tracking-widest transition-all duration-500"
                        style={{
                            backgroundImage: !config.logo_url ? `linear-gradient(to right, ${config.brand_color_start || config.primary_color}, ${config.brand_color_end || "#ffffff"})` : undefined,
                            WebkitBackgroundClip: !config.logo_url ? "text" : undefined,
                            WebkitTextFillColor: !config.logo_url ? "transparent" : undefined,
                            color: config.logo_url ? "white" : undefined
                        }}
                    >
                        {config.brand_name || "AuraStore"}
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-xs font-bold text-white/60 uppercase tracking-widest hover:text-primary transition-colors hover:glow-text relative group"
                        >
                            {link.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-300" />
                        </Link>
                    ))}
                </nav>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        href="/login"
                        className="px-6 py-2.5 rounded-xl border border-white/10 text-white/80 hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all"
                    >
                        Connexion
                    </Link>
                    <Link
                        href="/login?signup=true"
                        className="px-6 py-2.5 rounded-xl bg-primary text-black hover:bg-emerald-400 text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center gap-2 group"
                    >
                        Commencer
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-[#0A0A0C] border-b border-white/5 overflow-hidden"
                    >
                        <nav className="p-6 space-y-4">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block text-sm font-black text-white uppercase tracking-widest py-3 border-b border-white/5 hover:text-primary transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-4 space-y-3">
                                <Link
                                    href="/login"
                                    className="block w-full text-center py-3 rounded-xl border border-white/10 text-white font-black uppercase text-xs tracking-widest"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href="/login?signup=true"
                                    className="block w-full text-center py-3 rounded-xl bg-primary text-black font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20"
                                >
                                    Créer ma boutique
                                </Link>
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
