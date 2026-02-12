"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { BlockConfig } from "@/lib/theme-engine/types";
import type { Product } from "@/lib/supabase/types";
import { ShoppingBag, Package } from "lucide-react";

interface ProductGridProps {
    config: BlockConfig;
    products?: Product[];
    storeSlug?: string;
    isSubdomain?: boolean;
}

interface ProductGridBlockProps {
    title?: string;
    limit?: number;
    columns?: number;
    showPrice?: boolean;
}

// Placeholder products for demo
const DEMO_PRODUCTS: Partial<Product>[] = [
    {
        id: "1",
        name: "Maillot Can 2025 Cote d'Ivoire",
        slug: "maillot-can-2025",
        price: 5000,
        compare_at_price: 7500,
        category: "Sports",
        stock: 12,
        images: ["/products/jersey-ivory.jpg"],
    },
    {
        id: "2",
        name: "Ensemble Volcanique Edition Luxe",
        slug: "ensemble-volcanique",
        price: 15000,
        compare_at_price: 25000,
        category: "Mode",
        stock: 5,
        images: ["/products/luxe-outfit.jpg"],
    },
    {
        id: "3",
        name: "Sneakers Aura Tech-Pro",
        slug: "aura-tech-pro",
        price: 45000,
        compare_at_price: 60000,
        category: "Chaussures",
        stock: 8,
        images: ["/products/sneakers-tech.jpg"],
    },
    {
        id: "4",
        name: "Accessoire Signature Or",
        slug: "signature-gold",
        price: 2500,
        compare_at_price: 5000,
        category: "Bijoux",
        stock: 0,
        images: ["/products/gold-accessory.jpg"],
    },
];

import { useCurrency } from "@/lib/theme-engine/currency-context";
import { formatPrice } from "@/lib/currency-engine";

export function ProductGrid({ config, products, storeSlug, isSubdomain }: ProductGridProps) {
    const { currency } = useCurrency();
    const props = config.props as ProductGridBlockProps;
    const {
        title = "Featured Products",
        limit = 4,
        columns = 4,
        showPrice = true,
    } = props;

    const displayProducts = products?.slice(0, limit) || DEMO_PRODUCTS.slice(0, limit);

    const gridCols = {
        2: "grid-cols-2",
        3: "grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-2 lg:grid-cols-4",
    }[columns] || "grid-cols-2 lg:grid-cols-4";

    return (
        <section className="py-16 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                {title && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="font-display text-3xl md:text-4xl font-bold">
                            {title}
                        </h2>
                        <div className="w-20 h-1 bg-gradient-to-r from-[var(--theme-primary,#FE7501)] to-[var(--theme-secondary,#B4160B)] mx-auto mt-4 rounded-full" />
                    </motion.div>
                )}

                {/* Products Grid */}
                <div className={`grid ${gridCols} gap-6 md:gap-8`}>
                    {displayProducts.map((product, index) => {
                        const productLink = storeSlug
                            ? (isSubdomain ? `/products/${product.slug}` : `/store/${storeSlug}/products/${product.slug}`)
                            : `/dashboard/demo/products/${product.id}`;

                        return (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <Link href={productLink} className="group block h-full">
                                    <div className="relative flex flex-col h-full bg-white/[0.03] border border-white/5 rounded-[2rem] overflow-hidden hover:bg-white/[0.05] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">

                                        {/* Image Section */}
                                        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
                                            {product.images?.[0] ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name || "Product"}
                                                    fill
                                                    priority={index < 4}
                                                    className="object-cover transition-transform duration-1000 group-hover:scale-110 brightness-90 group-hover:brightness-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
                                                    <Package className="w-12 h-12 text-white/5" />
                                                </div>
                                            )}

                                            {/* Offer Label */}
                                            {product.compare_at_price && product.compare_at_price > (product.price || 0) && (
                                                <div className="absolute top-4 left-4 z-10">
                                                    <span className="px-3 py-1 bg-primary text-black font-black text-[9px] uppercase tracking-widest rounded-full shadow-xl">
                                                        Offre Limitée
                                                    </span>
                                                </div>
                                            )}

                                            {/* Quick Action Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]">
                                                <span className="px-6 py-3 bg-white text-black font-black uppercase tracking-[0.2em] rounded-xl text-[10px] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                    Acquérir
                                                </span>
                                            </div>
                                        </div>

                                        {/* Info Section */}
                                        <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 group-hover:text-primary transition-colors">
                                                    {product.category || "Collection AURA"}
                                                </p>
                                                <h3 className="font-display font-bold text-white/90 text-sm md:text-base group-hover:text-white transition-colors line-clamp-2">
                                                    {product.name}
                                                </h3>
                                            </div>

                                            <div className="pt-4 border-t border-white/5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        {showPrice && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl font-display font-black text-white">
                                                                    {formatPrice(product.price || 0, currency)}
                                                                </span>
                                                                {product.compare_at_price && product.compare_at_price > (product.price || 0) && (
                                                                    <span className="text-xs text-white/20 line-through">
                                                                        {formatPrice(product.compare_at_price, currency)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-2 bg-white/5 rounded-xl group-hover:bg-primary group-hover:text-black transition-all">
                                                        <ShoppingBag className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {/* View All Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mt-16"
                >
                    <Link
                        href={storeSlug ? `/store/${storeSlug}/products` : "/products"}
                        className="group inline-flex items-center gap-3 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all"
                    >
                        Explorer toute la collection
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
