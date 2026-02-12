"use client";

import { motion } from "framer-motion";
import { BlockConfig } from "@/lib/theme-engine/types";

interface MarqueeProps {
    config: BlockConfig;
}

interface MarqueeBlockProps {
    text?: string;
    speed?: number;
    direction?: "left" | "right";
}

export function Marquee({ config }: MarqueeProps) {
    const props = config.props as MarqueeBlockProps;
    const {
        text = "FREE SHIPPING ON ORDERS OVER $100 • NEW ARRIVALS EVERY WEEK • ",
        speed = 30,
        direction = "left",
    } = props;

    // Repeat text for seamless loop
    const repeatedText = Array(10).fill(text).join("");

    return (
        <section className="py-4 bg-[var(--theme-primary,#FE7501)] overflow-hidden">
            <motion.div
                animate={{
                    x: direction === "left" ? [0, -50 * text.length] : [-50 * text.length, 0],
                }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: speed,
                        ease: "linear",
                    },
                }}
                className="whitespace-nowrap"
            >
                <span className="text-sm md:text-base font-bold tracking-widest text-white uppercase">
                    {repeatedText}
                </span>
            </motion.div>
        </section>
    );
}
