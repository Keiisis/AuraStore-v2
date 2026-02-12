"use client";

import Link from "next/link";
import { Store } from "@/lib/supabase/types";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface StorefrontFooterProps {
    store: Store;
}

export function StorefrontFooter({ store }: StorefrontFooterProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-white/5 bg-[var(--theme-surface,#111111)]">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2 group relative inline-block">
                            {store.logo_url ? (
                                <motion.div
                                    className="relative"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {/* Extraordinary Glow/Pulse Effect */}
                                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse group-hover:bg-primary/40 transition-colors pointer-events-none" />

                                    <div className="relative h-12 w-40">
                                        <Image
                                            src={store.logo_url}
                                            alt={store.name}
                                            fill
                                            priority
                                            className="object-contain relative z-10 animate-extraordinary-clash hover:brightness-125 transition-all duration-500"
                                        />
                                    </div>
                                </motion.div>
                            ) : (
                                <h3 className="font-display font-bold text-xl text-white tracking-tight hover:text-primary transition-colors">{store.name}</h3>
                            )}
                        </Link>
                        <p className="text-sm text-white/40 leading-relaxed max-w-sm">
                            {store.description || "Your premium destination for quality products."}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-white/80">Quick Links</h4>
                        <nav className="flex flex-col space-y-2">
                            <Link href="/" className="text-sm text-white/40 hover:text-white transition-colors">
                                Home
                            </Link>
                            <Link href="/products" className="text-sm text-white/40 hover:text-white transition-colors">
                                Products
                            </Link>
                            <Link href="/about" className="text-sm text-white/40 hover:text-white transition-colors">
                                About Us
                            </Link>
                            <Link href="/contact" className="text-sm text-white/40 hover:text-white transition-colors">
                                Contact
                            </Link>
                        </nav>
                    </div>

                    {/* Support */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-white/80">Support</h4>
                        <nav className="flex flex-col space-y-2">
                            <Link href="/faq" className="text-sm text-white/40 hover:text-white transition-colors">
                                FAQ
                            </Link>
                            <Link href="/shipping" className="text-sm text-white/40 hover:text-white transition-colors">
                                Shipping Info
                            </Link>
                            <Link href="/returns" className="text-sm text-white/40 hover:text-white transition-colors">
                                Returns
                            </Link>
                            <Link href="/privacy" className="text-sm text-white/40 hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                        </nav>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-white/80">Stay Updated</h4>
                        <p className="text-sm text-white/40">
                            Subscribe to get special offers and updates.
                        </p>
                        <form className="flex gap-2">
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary,#FE7501)]/50"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[var(--theme-primary,#FE7501)] text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Join
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-white/30">
                        © {mounted ? currentYear : "2026"} {store.name}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-white/20">Powered by</span>
                        <Link
                            href="https://aurastore.com"
                            target="_blank"
                            className="text-sm font-medium text-[var(--theme-primary,#FE7501)] hover:underline"
                        >
                            AuraStore
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
