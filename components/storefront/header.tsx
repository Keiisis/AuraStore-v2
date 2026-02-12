import Link from "next/link";
import { Store } from "@/lib/supabase/types";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useCurrency } from "@/lib/theme-engine/currency-context";
import { CURRENCIES, CurrencyCode } from "@/lib/currency-engine";
import { useCart } from "@/components/store/cart-context";

import Image from "next/image";

interface StorefrontHeaderProps {
    store: Store;
}

export function StorefrontHeader({ store }: StorefrontHeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { currency, setCurrency } = useCurrency();
    const { openCart, cartCount } = useCart();

    return (
        <>
            <header className="sticky top-0 z-50 bg-[var(--theme-background,#0A0A0A)]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-2 group relative">
                        {store.logo_url ? (
                            <motion.div
                                className="relative h-10 md:h-12 w-32 md:w-40"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                            >
                                {/* Extraordinary Glow/Pulse Effect */}
                                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse group-hover:bg-primary/40 transition-colors pointer-events-none" />

                                <Image
                                    src={store.logo_url}
                                    alt={store.name}
                                    fill
                                    priority
                                    className="object-contain z-10 animate-extraordinary-clash hover:brightness-125 transition-all duration-500"
                                />
                            </motion.div>
                        ) : (
                            <span className="font-display font-black text-lg md:text-2xl text-white tracking-tighter uppercase italic group-hover:text-primary transition-all duration-300">{store.name}</span>
                        )}
                    </Link>

                    {/* Desktop Navigation ... (unchanged) */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-sm text-white/60 hover:text-white transition-colors">Home</Link>
                        <Link href="/products" className="text-sm text-white/60 hover:text-white transition-colors">Products</Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Currency Selector */}
                        <div className="hidden sm:flex items-center bg-white/5 rounded-lg p-0.5 border border-white/5">
                            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                                <button
                                    key={code}
                                    onClick={() => setCurrency(code)}
                                    className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${currency === code
                                        ? "bg-white text-black shadow-lg"
                                        : "text-white/40 hover:text-white/60"
                                        }`}
                                >
                                    {code}
                                </button>
                            ))}
                        </div>

                        {/* Cart Button */}
                        <button
                            onClick={openCart}
                            className="relative p-2 hover:bg-white/5 rounded-lg transition-colors group"
                        >
                            <ShoppingBag className="w-5 h-5 text-white/80 group-hover:text-primary transition-colors" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full text-xs font-bold flex items-center justify-center shadow-lg shadow-primary/20">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5 text-white/80" />
                            ) : (
                                <Menu className="w-5 h-5 text-white/80" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: "100%" }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-2xl md:hidden flex flex-col pt-24 px-8"
                        >
                            {/* Close Button Inside Menu */}
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-8 h-8 text-white" />
                            </button>

                            <nav className="flex flex-col space-y-4">
                                {[
                                    { label: "Home", href: "/" },
                                    { label: "Collection", href: "/products" },
                                    { label: "À Propos", href: "/about" },
                                    { label: "Contact", href: "/contact" }
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.href}
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="text-4xl font-black uppercase tracking-tighter text-white hover:text-primary transition-colors block"
                                        >
                                            {item.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>

                            <div className="mt-auto pb-12 space-y-8">
                                <div className="h-px w-full bg-white/10" />
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Devise Nexus</p>
                                    <div className="flex gap-4">
                                        {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                                            <button
                                                key={code}
                                                onClick={() => setCurrency(code)}
                                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${currency === code
                                                    ? "bg-primary text-white shadow-lg"
                                                    : "bg-white/5 text-white/40"
                                                    }`}
                                            >
                                                {code}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
        </>
    );
}
