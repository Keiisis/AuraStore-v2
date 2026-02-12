"use client";

import { useState } from "react";
import { Sparkles, TrendingUp, BrainCircuit, Rocket, Target, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { askAuraAssistant } from "@/lib/actions/ai";
import { toast } from "sonner";

interface AiBusinessPulseProps {
    revenue: number;
    ordersCount: number;
    storeName: string;
    ordersData: any[];
}

export function AiBusinessPulse({ revenue, ordersCount, storeName, ordersData }: AiBusinessPulseProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setAnalysis(null);

        const prompt = `
            Analyse mes performances commerciales actuelles pour la boutique "${storeName}". 
            Chiffre d'Affaires : ${revenue} FCFA.
            Nombre de commandes : ${ordersCount}.
            Données brutes des commandes : ${JSON.stringify(ordersData.slice(0, 10))}.

            En tant que Gentleman des Affaires expert en PNL, donne moi :
            1. Une analyse courte et percutante de mon CA.
            2. Un conseil stratégique pour augmenter mon panier moyen.
            3. Une phrase de motivation "Elite" pour finir.
            Utilise un ton formel, strict, mais extrêmement inspirant.
        `;

        const response = await askAuraAssistant(prompt);

        if (response.success) {
            setAnalysis(response.answer);
            toast.success("Analyse Stratégique Terminée. Excellence confirmée. 🎩");
        } else {
            toast.error("Échec de la connexion à l'intelligence centrale.");
        }
        setIsAnalyzing(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <BrainCircuit className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Intelligence d'Affaires</h2>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Propulsé par Aura Assistant Elite</p>
                    </div>
                </div>

                <motion.button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all ${isAnalyzing
                            ? "bg-white/5 text-white/20 cursor-wait"
                            : "bg-primary text-white shadow-[0_15px_40px_rgba(254,117,1,0.25)] hover:shadow-[0_20px_50px_rgba(254,117,1,0.4)]"
                        }`}
                >
                    {isAnalyzing ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Analyse en cours...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4" />
                            Générer le Business Pulse
                        </>
                    )}
                </motion.button>
            </div>

            <AnimatePresence mode="wait">
                {analysis ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                            <Quote className="w-32 h-32 text-white" />
                        </div>

                        <div className="p-8 md:p-12 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Target className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest underline decoration-primary/30">Diagnostic CA</span>
                                    </div>
                                    <p className="text-white/80 text-sm leading-relaxed font-medium">
                                        {analysis.split('2.')[0].replace('1.', '').trim()}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-emerald-500">
                                        <Rocket className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest underline decoration-emerald-500/30">Stratégie d'Élite</span>
                                    </div>
                                    <p className="text-white/80 text-sm leading-relaxed font-medium">
                                        {analysis.split('2.')[1]?.split('3.')[0]?.trim() || "Analyse en attente..."}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-purple-500">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest underline decoration-purple-500/30">Vision Aura</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 italic text-white/50 text-xs leading-relaxed">
                                        "{analysis.split('3.')[1]?.trim() || "L'excellence est une habitude, pas un acte."}"
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-4 bg-primary/5 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Rapport Confidentiel - Aura Business v2.0</span>
                            <div className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/10" />
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    !isAnalyzing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-64 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-8 space-y-4 group hover:border-primary/30 transition-colors"
                        >
                            <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Sparkles className="w-6 h-6 text-white/10 group-hover:text-primary" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-white/40 text-xs font-black uppercase tracking-widest">Prêt pour l'analyse ?</p>
                                <p className="text-white/20 text-[10px] max-w-[200px] mx-auto uppercase tracking-tighter">L'IA de luxe attend vos instructions pour scanner votre empire.</p>
                            </div>
                        </motion.div>
                    )
                )}
            </AnimatePresence>
        </div>
    );
}
