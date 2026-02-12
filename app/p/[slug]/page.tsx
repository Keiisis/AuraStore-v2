"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { DynamicBackground } from "@/components/landing/dynamic-background";
import { motion } from "framer-motion";
import { MoveLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const FALLBACK_PAGES: Record<string, any> = {
    'about': { title: 'À Propos d\'AuraStore', category: 'corporate', content: 'L\'élégance technologique au service du commerce. AuraStore redéfinit les standards du shopping immersif.' },
    'careers': { title: 'Carrières', category: 'corporate', content: 'Rejoignez l\'élite de la tech-fashion. Nous construisons le futur du commerce en Afrique.' },
    'blog': { title: 'Blog Elite', category: 'corporate', content: 'Analyses, tendances et visions sur le futur du e-commerce et de l\'IA.' },
    'contact': { title: 'Contact & Support', category: 'general', content: 'Une équipe dédiée à votre succès. Contactez l\'excellence.' },
    'changelog': { title: 'Mises à jour', category: 'general', content: 'Découvrez les dernières innovations de l\'Aura Engine.' },
    'terms': { title: 'CGV / CGU', category: 'legal', content: 'Conditions Générales de Vente et d\'Utilisation de la plateforme.' },
    'privacy': { title: 'Confidentialité', category: 'legal', content: 'Votre vie privée est notre priorité absolue. Vos données sont protégées.' },
    'cookies': { title: 'Cookies', category: 'legal', content: 'Transparence totale sur notre utilisation des cookies.' }
};

export default function StaticPage({ params }: { params: { slug: string } }) {
    const supabase = createClient();
    const [page, setPage] = useState<any>(null);
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const { data: pageData, error: pageError } = await supabase
                    .from("static_pages")
                    .select("*")
                    .eq("slug", params.slug)
                    .eq("is_active", true)
                    .single();

                if (pageError || !pageData) {
                    // Use fallback if not in DB
                    setPage(FALLBACK_PAGES[params.slug] || null);
                } else {
                    setPage(pageData);
                }

                const res = await fetch("/api/config");
                const configData = await res.json();
                setConfig(configData);
            } catch (error) {
                console.error("Error loading page data:", error);
                setPage(FALLBACK_PAGES[params.slug] || null);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [params.slug, supabase]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!page) {
        notFound();
    }

    return (
        <div className="min-h-screen relative selection:bg-primary/20 selection:text-primary">
            <DynamicBackground />
            <LandingHeader config={config} />

            <main className="pt-40 pb-32 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-white/40 hover:text-primary transition-colors mb-12 text-xs font-black uppercase tracking-widest group"
                    >
                        <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Retour
                    </Link>

                    <div className="space-y-4 mb-20">
                        <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-[10px] font-black tracking-[0.4em] text-primary uppercase"
                        >
                            {page.category}
                        </motion.p>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none"
                        >
                            {page.title}
                        </motion.h1>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: 80 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="h-1 bg-gradient-to-r from-primary to-transparent rounded-full"
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="max-w-none"
                    >
                        <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 md:p-16 backdrop-blur-3xl shadow-2xl shadow-black/50 relative overflow-hidden group">
                            {/* Decorative ambient light inside card */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

                            <div className="relative z-10 space-y-8">
                                {page.content.split('\n').map((para: string, i: number) => (
                                    <p key={i} className="text-white/60 text-lg leading-relaxed font-medium">
                                        {para}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </main>

            <LandingFooter config={config} />
        </div>
    );
}
