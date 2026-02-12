"use client";

import React, { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
    OrbitControls,
    Stage,
    Float,
    ContactShadows,
    Html,
    useProgress,
    useTexture,
    MeshReflectorMaterial,
    useGLTF,
    MeshWobbleMaterial,
    Sparkles,
    Text,
    Environment,
    SpotLight,
    Lightformer,
    Center
} from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles as SparklesIcon, Cpu, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useTransition, useEffect } from "react";

function LoadingScreen() {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex flex-col items-center gap-4 min-w-[200px]">
                <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <div className="space-y-1 text-center">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Séquence Initiation Aura</p>
                    <p className="text-[14px] font-black text-white italic">{Math.round(progress)}%</p>
                </div>
            </div>
        </Html>
    );
}

function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    const modelRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (modelRef.current) {
            modelRef.current.rotation.y += 0.005;
            modelRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.1;
        }
    });

    return (
        <group ref={modelRef}>
            <primitive object={scene} scale={1.8} />
            <Sparkles count={40} scale={3} size={2} speed={0.4} opacity={0.2} color="#FE7501" />
        </group>
    );
}

function AuraHologram({ productImage, productName }: { productImage?: string, productName?: string }) {
    const texture = productImage ? useTexture(productImage) : null;
    const scannerRef = useRef<THREE.Mesh>(null);
    const plateRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (scannerRef.current) {
            scannerRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 2) * 0.8;
        }
        if (plateRef.current) {
            plateRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
        }
    });

    return (
        <group>
            {/* Cinematic Floor Reflector */}
            <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[4, 64]} />
                <MeshReflectorMaterial
                    blur={[400, 100]}
                    resolution={1024}
                    mixBlur={1}
                    mixStrength={15}
                    roughness={1}
                    depthScale={1.2}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#080808"
                    metalness={0.5}
                    mirror={0.5}
                />
            </mesh>

            <Float speed={3} rotationIntensity={1.2} floatIntensity={1}>
                {productImage ? (
                    <group>
                        <mesh castShadow ref={plateRef}>
                            <boxGeometry args={[1.4, 1.8, 0.08]} />
                            <meshStandardMaterial
                                map={texture}
                                transparent
                                emissive="#ffffff"
                                emissiveIntensity={0.05}
                                roughness={0.1}
                                metalness={0.9}
                            />
                            {/* Inner Glow Border */}
                            <mesh scale={[1.02, 1.02, 1.1]}>
                                <boxGeometry args={[1.4, 1.8, 0.08]} />
                                <meshStandardMaterial
                                    color="#FE7501"
                                    transparent
                                    opacity={0.3}
                                    wireframe
                                    emissive="#FE7501"
                                    emissiveIntensity={2}
                                />
                            </mesh>
                        </mesh>

                        {/* Scanner Effect */}
                        <mesh ref={scannerRef} position={[0, 0, 0.06]}>
                            <planeGeometry args={[1.6, 0.02]} />
                            <meshBasicMaterial color="#FE7501" transparent opacity={0.8} />
                            <pointLight distance={0.5} intensity={2} color="#FE7501" />
                        </mesh>

                        {/* Floating Text Asset ID */}
                        <Text
                            position={[0, -1.2, 0.2]}
                            fontSize={0.07}
                            color="#FE7501"
                            anchorX="center"
                            anchorY="middle"
                            maxWidth={1.5}
                            textAlign="center"
                        >
                            {productName?.toUpperCase() || "AURA ASSET"}
                        </Text>
                    </group>
                ) : (
                    <group>
                        <mesh castShadow>
                            <octahedronGeometry args={[1.2]} />
                            <MeshWobbleMaterial color="#FE7501" speed={2} factor={1} metalness={0.8} emissive="#FE7501" emissiveIntensity={0.2} />
                        </mesh>
                    </group>
                )}
            </Float>

            {/* Atmosphere */}
            <Sparkles count={60} scale={4} size={3} speed={0.2} opacity={0.1} color="#FE7501" />

            <SpotLight
                position={[5, 5, 5]}
                angle={0.15}
                penumbra={1}
                intensity={2}
                castShadow
                color="#FE7501"
            />
        </group>
    );
}

export function Aura3DViewer({ modelUrl, productName, productImage, storeId }: { modelUrl?: string, productName?: string, productImage?: string, storeId?: string }) {
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [hasFalKey, setHasFalKey] = useState<boolean | null>(null);

    useEffect(() => {
        const checkConfig = async () => {
            if (!storeId) return;
            try {
                const res = await fetch('/api/ai/check-config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ storeId })
                });
                const data = await res.json();
                setHasFalKey(data.hasKey);
            } catch (e) {
                setHasFalKey(false);
            }
        };
        checkConfig();
    }, [storeId]);

    // Specialized models mapping
    const finalModelUrl = generatedUrl || modelUrl || (
        (productName?.toLowerCase().includes('chaussure') || productName?.toLowerCase().includes('sneaker'))
            ? "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/sneaker/model.gltf"
            : undefined
    );

    const handleGenerate3D = async () => {
        if (!productImage || !storeId) {
            toast.error("Données insuffisantes pour la génération.");
            return;
        }

        setIsGenerating(true);
        toast.info("Lancement du moteur Hunyuan3D... Préparez-vous à l'incroyable.", { icon: <Cpu className="w-4 h-4" /> });

        try {
            const response = await fetch('/api/ai/image-to-3d', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productImage, storeId })
            });

            const data = await response.json();
            if (data.glbUrl) {
                setGeneratedUrl(data.glbUrl);
                toast.success("Artéfact 3D généré avec succès par l'IA !");
            } else {
                throw new Error(data.error || "L'API n'a pas renvoyé de modèle.");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Le moteur Hunyuan3D a rencontré un obstacle.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full h-full relative bg-[#08080A]">
            {/* Cinematic Vignette */}
            <div className="absolute inset-0 pointer-events-none z-10 shadow-[inner_0_0_150px_rgba(0,0,0,0.9)]" />

            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4.5], fov: 40 }}>
                <Suspense fallback={<LoadingScreen />}>
                    <color attach="background" args={["#050507"]} />

                    <Environment preset="night" blur={0.8}>
                        <Lightformer position={[5, 0, -5]} scale={10} color="#FE7501" intensity={2} />
                        <Lightformer position={[-5, 2, -10]} scale={10} color="purple" intensity={1} />
                    </Environment>

                    {finalModelUrl ? (
                        <Stage environment="city" intensity={0.6} contactShadow={{ opacity: 0.5, blur: 3 }} adjustCamera={false}>
                            <Model url={finalModelUrl} />
                        </Stage>
                    ) : (
                        <AuraHologram productImage={productImage} productName={productName} />
                    )}

                    <OrbitControls
                        makeDefault
                        autoRotate
                        autoRotateSpeed={0.8}
                        enableZoom={false}
                        maxPolarAngle={Math.PI / 1.8}
                        minPolarAngle={Math.PI / 3}
                    />

                    {/* Volumetric Fog Effect */}
                    <fog attach="fog" args={["#050507", 5, 15]} />
                </Suspense>
            </Canvas>

            {/* UI Overlay */}
            <div className="absolute top-6 left-6 flex flex-col gap-2 opacity-80 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    <span className="text-[8px] font-black text-white uppercase tracking-[0.3em]">System Aura™ v3.1</span>
                </div>
                {isGenerating && (
                    <div className="flex items-center gap-2 text-primary animate-pulse">
                        <Cpu className="w-3 h-3 animate-spin" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Génération de l'Asset IA...</span>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {hasFalKey && !finalModelUrl && !isGenerating && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                    >
                        <button
                            onClick={handleGenerate3D}
                            className="pointer-events-auto group relative px-6 py-3 rounded-full bg-primary overflow-hidden transition-all hover:scale-105 active:scale-95"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <div className="relative flex items-center gap-2">
                                <Wand2 className="w-4 h-4 text-black" />
                                <span className="text-[10px] font-black text-black uppercase tracking-wider">
                                    Générer avec Hunyuan3D IA
                                </span>
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none group">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-12 rounded-full border border-white/10 flex justify-center p-1">
                        <motion.div
                            animate={{ y: [0, 15, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-1 h-3 bg-primary rounded-full"
                        />
                    </div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] group-hover:text-primary transition-colors">Interagir avec l'Asset</p>
                </div>
            </div>
        </div>
    );
}
