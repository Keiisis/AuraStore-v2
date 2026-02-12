"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export function DynamicBackground() {
    const { scrollYProgress } = useScroll();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Smooth movement for parallax
    const smoothX = useSpring(0, { stiffness: 50, damping: 20 });
    const smoothY = useSpring(0, { stiffness: 50, damping: 20 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const moveX = (clientX / window.innerWidth - 0.5) * 40; // 40px movement
            const moveY = (clientY / window.innerHeight - 0.5) * 40;
            smoothX.set(moveX);
            smoothY.set(moveY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [smoothX, smoothY]);

    const backgroundScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.3]);
    const backgroundOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.7, 0.8, 0.8, 0.5]);

    return (
        <div className="fixed inset-0 -z-30 overflow-hidden bg-[#020203] pointer-events-none">
            {/* The Cinematic "Vanguard Showroom" Layer */}
            <motion.div
                style={{
                    x: smoothX,
                    y: smoothY,
                    scale: backgroundScale,
                    opacity: backgroundOpacity
                }}
                className="absolute inset-0 w-[110%] h-[110%] -left-[5%] -top-[5%]"
            >
                <Image
                    src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2070&auto=format&fit=crop"
                    alt="Vanguard Showroom"
                    fill
                    className="object-cover grayscale-[0.2] brightness-[0.7] contrast-[1.1]"
                    priority
                />
                {/* Immersive Overlay: Smart Neural Network */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/80" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]/40" />
            </motion.div>

            {/* Glossy & Addictive Effects */}

            {/* Pulsing Light Reflections (Simulating Holograms) */}
            <motion.div
                animate={{
                    opacity: [0.1, 0.3, 0.1],
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-[20%] left-[15%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen"
            />

            <motion.div
                animate={{
                    opacity: [0.05, 0.2, 0.05],
                    x: [0, 20, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
                className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[150px] rounded-full mix-blend-screen"
            />

            {/* Smart Scanlines (Technical Aesthetic) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.005),rgba(0,0,255,0.01))] z-10 bg-[length:100%_3px,4px_100%] opacity-20" />

            {/* Kinetic Energy Particle Layer */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.05] mix-blend-overlay" />

            {/* Glassmorphic Frost Layer for Ergonomics */}
            <div className="absolute inset-0 backdrop-blur-[30px] bg-black/10" />

            {/* The "Neural Scan" Bar */}
            <motion.div
                initial={{ y: "-100%", opacity: 0 }}
                animate={{ y: "200%", opacity: [0, 1, 0] }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute inset-x-0 h-[2px] bg-white/20 z-20 shadow-[0_0_20px_white]"
            />

            {/* Final Vignette for Power focus */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        </div>
    );
}
