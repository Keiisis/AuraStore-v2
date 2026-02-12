"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DynamicBackground } from "@/components/landing/dynamic-background";
import { getBlogs, generateAIBlog } from "@/lib/actions/blog";
import { Loader2, Calendar, User, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function BlogPage() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { blogs: data } = await getBlogs();
            setBlogs(data);
            setLoading(false);

            // Auto-check if we should generate a new one (e.g. if empty or old)
            // For now, let's just trigger one if empty for demo
            if (data.length === 0) {
                const res = await generateAIBlog();
                if (res.success) {
                    const { blogs: newData } = await getBlogs();
                    setBlogs(newData);
                }
            }
        };
        load();
    }, []);

    return (
        <main className="min-h-screen bg-black relative overflow-hidden selection:bg-primary selection:text-black">
            <DynamicBackground />

            {/* Content Area */}
            <div className="relative z-10 pt-32 pb-24 px-6">
                <div className="max-w-6xl mx-auto space-y-20">
                    {/* Header */}
                    <div className="text-center space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
                        >
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Aura Intelligence Journal</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter"
                        >
                            The <span className="text-primary">Aura</span> Hub
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/40 text-lg max-w-2xl mx-auto font-medium"
                        >
                            Réflexions sur l'IA, le Luxe et le Futur du Commerce Digital — Écrit par notre IA Plume.
                        </motion.p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Initialisation de la pensée artificielle...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blogs.map((blog, idx) => (
                                <motion.article
                                    key={blog.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group relative"
                                >
                                    <Link href={`/p/blog/${blog.slug}`} className="block space-y-6">
                                        {/* Image Container */}
                                        <div className="aspect-[16/10] rounded-3xl overflow-hidden border border-white/10 relative">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-60 z-10" />
                                            {blog.image_url && (
                                                <img
                                                    src={blog.image_url}
                                                    alt={blog.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            )}
                                            <div className="absolute top-4 left-4 z-20">
                                                <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[8px] font-black uppercase tracking-widest text-white">
                                                    {blog.category}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Meta */}
                                        <div className="flex items-center gap-4 px-2">
                                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/30">
                                                <Calendar className="w-3 h-3 text-primary" />
                                                {new Date(blog.created_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/30">
                                                <User className="w-3 h-3 text-primary" />
                                                {blog.author}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-3 px-2">
                                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-tight group-hover:text-primary transition-colors">
                                                {blog.title}
                                            </h2>
                                            <p className="text-white/40 text-sm line-clamp-3 leading-relaxed">
                                                {blog.excerpt}
                                            </p>
                                        </div>

                                        {/* CTA */}
                                        <div className="pt-2 px-2">
                                            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary group-hover:gap-4 transition-all">
                                                Lire l'article <ArrowRight className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
