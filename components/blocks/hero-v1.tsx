"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { BlockConfig } from "@/lib/theme-engine/types";

interface HeroV1Props {
    config: BlockConfig;
}

interface HeroV1BlockProps {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    backgroundImage?: string | null;
}

export function HeroV1({ config }: HeroV1Props) {
    const props = config.props as HeroV1BlockProps;
    const {
        title = "Welcome to the Future",
        subtitle = "Discover our exclusive collection",
        ctaText = "Shop Now",
        ctaLink = "/products",
        backgroundImage,
    } = props;

    return (
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
            {/* Background */}
            {backgroundImage ? (
                <div className="absolute inset-0">
                    <Image
                        src={backgroundImage}
                        alt="Hero Background"
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
                </div>
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-surface via-background to-background">
                    {/* Animated Orb */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--theme-primary,#FE7501)]/20 blur-[120px] rounded-full animate-blob-pulse" />
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-8"
                >
                    <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] md:leading-[0.9]">
                        {title.split(" ").map((word, i) => (
                            <span
                                key={i}
                                className={
                                    i % 2 === 1
                                        ? "text-transparent bg-clip-text bg-gradient-to-r from-[var(--theme-primary,#FE7501)] to-[var(--theme-secondary,#B4160B)]"
                                        : ""
                                }
                            >
                                {word}{" "}
                            </span>
                        ))}
                    </h1>

                    <p className="text-lg md:text-xl text-[var(--theme-text-muted,rgba(255,255,255,0.6))] max-w-2xl mx-auto">
                        {subtitle}
                    </p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="pt-4"
                    >
                        <Link
                            href={ctaLink}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[var(--theme-secondary,#B4160B)] to-[var(--theme-primary,#FE7501)] text-white font-bold rounded-full text-lg shadow-[0_20px_50px_rgba(254,117,1,0.3)] hover:scale-105 transition-transform duration-300"
                        >
                            {ctaText}
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                />
                            </svg>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-1.5 h-3 bg-white/40 rounded-full mt-2"
                    />
                </div>
            </motion.div>
        </section>
    );
}
