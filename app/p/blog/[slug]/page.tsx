"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { DynamicBackground } from "@/components/landing/dynamic-background";
import { Loader2, Calendar, User, ArrowLeft, Share2, Sparkles, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function BlogPostPage({ params }: { params: { slug: string } }) {
    const [blog, setBlog] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        const load = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from("blogs")
                .select("*")
                .eq("slug", params.slug)
                .single();
            setBlog(data);
            setLoading(false);
        };
        load();
    }, [params.slug]);

    if (loading) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Nexus Intelligence Sync...</p>
        </div>
    );

    if (!blog) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-8">Signal Perdu</h1>
            <Link href="/p/blog" className="px-8 py-4 bg-white/5 border border-white/10 text-primary font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-primary hover:text-black transition-all">
                Retour au Centre de Commande
            </Link>
        </div>
    );

    return (
        <main ref={containerRef} className="min-h-screen bg-[#050507] relative overflow-hidden selection:bg-primary selection:text-black">
            <DynamicBackground />

            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-primary z-[200] origin-left"
                style={{ scaleX }}
            />

            {/* Back Button Floating */}
            <div className="fixed top-12 left-12 z-50 hidden lg:block">
                <Link href="/p/blog" className="flex items-center gap-2 text-white/20 hover:text-primary transition-all group">
                    <div className="w-10 h-10 rounded-full border border-white/5 bg-white/0.02 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </div>
                </Link>
            </div>

            {/* Content area */}
            <div className="relative z-10 pt-44 pb-32 px-6">
                <article className="max-w-4xl mx-auto">
                    {/* Upper Meta */}
                    <div className="space-y-10 mb-24 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] border border-white/5 shadow-2xl backdrop-blur-md"
                        >
                            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">{blog.category}</span>
                            <div className="w-1 h-1 rounded-full bg-white/20" />
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-white/40" />
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">~8 min de lecture</span>
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-[0.85] text-balance"
                        >
                            {blog.title}
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-black text-[10px]">AI</div>
                                <div className="text-left">
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Rédacteur D'Élite</p>
                                    <p className="text-[11px] font-black text-white uppercase tracking-tighter">{blog.author}</p>
                                </div>
                            </div>

                            <div className="hidden md:block w-px h-8 bg-white/5" />

                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-primary" />
                                <div className="text-left">
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Date de Publication</p>
                                    <p className="text-[11px] font-black text-white uppercase tracking-tighter">
                                        {new Date(blog.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Featured Image Parallax-like */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="aspect-[21/9] rounded-[3rem] md:rounded-[4rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] mb-24 relative group"
                    >
                        {blog.image_url && (
                            <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent opacity-80" />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[3rem] md:rounded-[4rem]" />
                    </motion.div>

                    {/* Excerpt Section */}
                    <div className="mb-20 pb-20 border-b border-white/5">
                        <p className="text-2xl md:text-3xl font-bold text-white/90 leading-relaxed italic border-l-4 border-primary pl-8 py-4 bg-primary/5 rounded-r-3xl">
                            "{blog.excerpt}"
                        </p>
                    </div>

                    {/* Content Body */}
                    <div className="prose prose-invert prose-xl prose-p:text-white/70 prose-p:leading-[1.8] prose-p:font-medium prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter prose-headings:text-white prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-blockquote:border-primary prose-blockquote:bg-white/[0.02] prose-blockquote:p-8 prose-blockquote:rounded-3xl prose-img:rounded-[2.5rem] max-w-none">
                        <ReactMarkdown
                            components={{
                                h2: ({ node, ...props }) => <h2 className="text-3xl md:text-5xl mt-24 mb-10 text-primary/90" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-2xl md:text-3xl mt-16 mb-6" {...props} />,
                                p: ({ node, ...props }) => <p className="mb-8" {...props} />,
                                blockquote: ({ node, ...props }) => <blockquote className="relative my-12" {...props} />
                            }}
                        >
                            {blog.content}
                        </ReactMarkdown>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-32 p-12 rounded-[3.5rem] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 group">
                        <div className="space-y-4 text-center md:text-left">
                            <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">Prêt pour la Révolution ?</h4>
                            <p className="text-white/40 text-sm font-medium">Découvrez comment AuraStore transforme votre vision en empire digital.</p>
                            <Link href="/" className="inline-flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.3em] hover:gap-4 transition-all">
                                Explorer l'Écosystème <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="flex gap-4">
                            <button className="flex flex-col items-center gap-2 p-6 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all group/btn">
                                <Share2 className="w-6 h-6 text-white group-hover/btn:text-primary transition-colors" />
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 group-hover/btn:text-primary/60">Partager</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-20 text-center">
                        <Link href="/p/blog" className="inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-all">
                            <ArrowLeft className="w-4 h-4 text-primary" />
                            Retour à la Bibliothèque Archive
                        </Link>
                    </div>
                </article>
            </div>
        </main>
    );
}
