"use client";

import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { useState } from "react";

const themeCategories = [
    { name: "Streetwear", color: "#FE7501" },
    { name: "Techwear Luxe", color: "#6A00FF" },
    { name: "Traditionnel", color: "#00FF88" },
    { name: "Sneakers", color: "#FF00FF" },
    { name: "Bijoux", color: "#FFE946" },
    { name: "Cosmétiques", color: "#00D1FF" },
    { name: "Sacs & Étuis", color: "#FBBF24" },
    { name: "Accessoires", color: "#10B981" },
    { name: "Y2K Style", color: "#FF3E00" },
    { name: "Minimalist Couture", color: "#FFFFFF" }
];

function AnimatedBlob({ color }: { color: string }) {
    return (
        <mesh scale={1.5}>
            <Sphere args={[1, 32, 32]}>
                <MeshDistortMaterial
                    color={color}
                    speed={4}
                    distort={0.4}
                    radius={1}
                />
            </Sphere>
        </mesh>
    );
}

export function LandingThemes() {
    const [hoveredColor, setHoveredColor] = useState("#FE7501");

    return (
        <section id="univers" className="py-32 px-6 relative overflow-hidden">
            {/* 3D Background specifically for this section */}
            <div className="absolute right-0 top-0 w-full lg:w-1/2 h-full opacity-40 z-0 pointer-events-none">
                <Canvas camera={{ position: [0, 0, 5] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} />
                    <Float speed={2.5} rotationIntensity={1.5} floatIntensity={2.5}>
                        <AnimatedBlob color={hoveredColor} />
                    </Float>
                </Canvas>
            </div>

            <div className="max-w-7xl mx-auto space-y-20 relative z-10 scale-[0.98]">
                <div className="space-y-4">
                    <p className="text-[9px] font-black tracking-[0.4em] text-primary uppercase">Catalogues</p>
                    <h2 className="font-display text-4xl md:text-5xl font-black text-white max-w-2xl leading-[0.9]">
                        <span className="text-primary italic">10 identités</span> visuelles.<br />
                        La vôtre est ici.
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl">
                    {themeCategories.map((cat, idx) => (
                        <motion.div
                            key={cat.name}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            onMouseEnter={() => setHoveredColor(cat.color)}
                            className="group p-8 rounded-[2rem] bg-[#121216]/40 border border-white/[0.03] flex flex-col justify-between hover:bg-[#121216]/60 hover:border-primary/20 transition-all cursor-pointer aspect-square relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.02] -rotate-45 translate-x-8 -translate-y-8" />

                            <div className="w-2 h-2 rounded-full transition-all duration-500 group-hover:scale-150 group-hover:shadow-[0_0_20px_rgba(254,117,1,0.5)]" style={{ backgroundColor: cat.color }} />

                            <div className="space-y-3">
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 group-hover:text-primary transition-colors">
                                    Identity {String(idx + 1).padStart(2, '0')}
                                </span>
                                <span className="block font-display font-black text-xs md:text-sm text-white/50 group-hover:text-white leading-tight uppercase tracking-widest">
                                    {cat.name}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
