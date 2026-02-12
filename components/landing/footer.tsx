import Link from "next/link";
import { Twitter, Instagram, Linkedin, Facebook } from "lucide-react";
import type { FrontendConfig } from "@/lib/actions/frontend";

interface LandingFooterProps {
    config: FrontendConfig;
}

export function LandingFooter({ config }: LandingFooterProps) {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-white/5 py-16 bg-transparent">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">

                {/* Brand */}
                <div className="space-y-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            {config.brand_name?.charAt(0) || "A"}
                        </div>
                        <span
                            className="text-lg font-black italic tracking-tighter uppercase"
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
                    <p className="text-xs text-white/40 leading-relaxed font-medium">
                        {config.seo_description || "La plateforme de commerce nouvelle génération pour les créateurs ambitieux."}
                    </p>
                    <div className="flex gap-4 pt-2">
                        <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"><Twitter className="w-4 h-4" /></a>
                        <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"><Instagram className="w-4 h-4" /></a>
                        <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"><Linkedin className="w-4 h-4" /></a>
                    </div>
                </div>

                {/* Products */}
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Produit</h4>
                    <ul className="space-y-2">
                        <li><Link href="/#themes" className="text-xs text-white/40 hover:text-primary transition-colors">Thèmes Premium</Link></li>
                        <li><Link href="/#technologie" className="text-xs text-white/40 hover:text-primary transition-colors">Fonctionnalités</Link></li>
                        <li><Link href="/#tarifs" className="text-xs text-white/40 hover:text-primary transition-colors">Tarifs</Link></li>
                        <li><Link href="/p/changelog" className="text-xs text-white/40 hover:text-primary transition-colors">Mises à jour</Link></li>
                    </ul>
                </div>

                {/* Company */}
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Entreprise</h4>
                    <ul className="space-y-2">
                        <li><Link href="/p/about" className="text-xs text-white/40 hover:text-primary transition-colors">À propos</Link></li>
                        <li><Link href="/p/careers" className="text-xs text-white/40 hover:text-primary transition-colors">Carrières</Link></li>
                        <li><Link href="/p/blog" className="text-xs text-white/40 hover:text-primary transition-colors">Blog</Link></li>
                        <li><Link href="/p/contact" className="text-xs text-white/40 hover:text-primary transition-colors">Contact</Link></li>
                    </ul>
                </div>

                {/* Legal */}
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Légal</h4>
                    <ul className="space-y-2">
                        <li><Link href="/p/terms" className="text-xs text-white/40 hover:text-primary transition-colors">CGV / CGU</Link></li>
                        <li><Link href="/p/privacy" className="text-xs text-white/40 hover:text-primary transition-colors">Confidentialité</Link></li>
                        <li><Link href="/p/cookies" className="text-xs text-white/40 hover:text-primary transition-colors">Cookies</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[10px] text-white/20 font-mono tracking-widest uppercase">
                    © {year} {config.brand_name || "AuraStore"}. All rights reserved.
                </p>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Système Opérationnel</span>
                </div>
            </div>
        </footer>
    );
}
