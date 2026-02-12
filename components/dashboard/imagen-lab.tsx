"use client";

import React, { useState } from "react";
import {
    Sparkles,
    Wand2,
    ImageIcon,
    Loader2,
    Download,
    RefreshCw,
    Zap,
    Send,
    LayoutTemplate
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ImagenLabProps {
    storeId: string;
}

export function ImagenLab({ storeId }: ImagenLabProps) {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState("1:1");
    const [model, setModel] = useState<"imagen" | "flux">("imagen");

    const generateImage = async () => {
        if (!prompt) {
            toast.error("Veuillez entrer une description (prompt).");
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch("/api/ai/imagen", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    storeId,
                    aspectRatio,
                    model
                })
            });

            const data = await response.json();

            if (data.output) {
                setGeneratedImage(data.output);
                toast.success("Visuel Google Imagen 4 généré !");
            } else if (data.predictionId) {
                // Polling logic simplification for the demo
                toast.info("Génération en cours sur les serveurs Google via Replicate...");
                // In a real app, you'd poll /api/ai/imagen/status
            } else {
                throw new Error(data.error || "Échec de la génération");
            }
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la génération Imagen.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header Lab */}
            <div className="bg-[#0A0A0C] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-primary">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Propulsé par Aura AI Forge</span>
                        </div>
                        <h1 className="text-4xl font-display font-black text-white italic tracking-tight">Imagen Lab™</h1>
                        <p className="text-white/40 font-medium text-sm max-w-md">Créez des visuels de luxe en quelques secondes grâce aux moteurs les plus puissants du marché.</p>
                    </div>

                    <div className="flex flex-col gap-4 items-end">
                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                            {["1:1", "16:9", "9:16", "4:3"].map((ratio) => (
                                <button
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${aspectRatio === ratio ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                            <button
                                onClick={() => setModel("imagen")}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${model === "imagen" ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                            >
                                <Zap className="w-3 h-3" /> Google Imagen 4
                            </button>
                            <button
                                onClick={() => setModel("flux")}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${model === "flux" ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
                            >
                                <Sparkles className="w-3 h-3" /> Flux 2 Pro
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Control Panel */}
                <div className="space-y-6">
                    <div className="bg-[#121217] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2 pl-1">
                                    <Wand2 className="w-3 h-3 text-primary" /> Vision du Visuel (Prompt)
                                </label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Ex: Une photo publicitaire haut de gamme d'un mannequin portant une veste en cuir noir dans un environnement cyberpunk, éclairage néon, 8k, ultra-réaliste..."
                                    className="w-full h-48 bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-sm text-white focus:outline-none focus:border-primary/40 transition-all font-medium placeholder:text-white/5 resize-none shadow-inner"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Qualité Rendu</p>
                                    <p className="text-xs font-bold text-white">Imagen 4 Ultra</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Sécurité</p>
                                    <p className="text-xs font-bold text-emerald-500">Filtrage Actif</p>
                                </div>
                            </div>

                            <button
                                onClick={generateImage}
                                disabled={isGenerating || !prompt}
                                className="w-full h-20 rounded-[1.5rem] bg-primary text-black font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/10 disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Séquence de Génération...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-6 h-6" />
                                        Générer avec Imagen 4
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#1A1108] to-transparent border border-primary/10 rounded-3xl p-6 flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                            <LayoutTemplate className="w-6 h-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Conseil Stratégique</p>
                            <p className="text-xs text-white/60 font-medium">Utilisez des mots-clés de photographie (85mm, studio light, bokeh) pour des résultats époustouflants.</p>
                        </div>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="relative group min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {generatedImage ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="h-full bg-[#121217] border border-white/10 rounded-[2.5rem] overflow-hidden relative shadow-2xl"
                            >
                                <img src={generatedImage} alt="AI Generated" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all p-8 flex flex-col justify-end gap-4">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => window.open(generatedImage, '_blank')}
                                            className="flex-1 h-14 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-colors"
                                        >
                                            <Download className="w-4 h-4" /> Télécharger
                                        </button>
                                        <button
                                            onClick={() => setGeneratedImage(null)}
                                            className="w-14 h-14 bg-white/10 backdrop-blur-md text-white rounded-xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                                        <p className="text-[10px] text-white/40 font-bold italic">"{prompt}"</p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full bg-[#121217] border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center space-y-6"
                            >
                                <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center relative">
                                    <ImageIcon className="w-10 h-10 text-white/10" />
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
                                        <Zap className="w-4 h-4 text-primary animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-white font-black uppercase italic tracking-widest">En attente de vision</h3>
                                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-[.2em] leading-relaxed">
                                        Le moteur Imagen 4 est prêt.<br />Décrivez votre visuel pour initialiser la forge.
                                    </p>
                                </div>
                                {isGenerating && (
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-[2.5rem]">
                                        <div className="space-y-4 flex flex-col items-center">
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                                                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                                            </div>
                                            <p className="text-primary font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">Forge IA Active</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
