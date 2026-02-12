"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Send, Clock, BookOpen } from "lucide-react";
import { generateAIBlog } from "@/lib/actions/blog";
import { toast } from "sonner";

export function BlogAutomationControl() {
    const [loading, setLoading] = useState(false);

    const handleTrigger = async () => {
        setLoading(true);
        try {
            const res = await generateAIBlog(true);
            if (res.success) {
                toast.success(`Article généré: ${res.title}`);
                window.location.reload();
            } else {
                toast.error(res.error || "Échec de la génération");
            }
        } catch (err) {
            toast.error("Erreur de connexion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="volcanic-glass p-8 border-primary/20 space-y-6"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Plume IA : Blog Autonome</h3>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Génération de contenu intelligent via Groq</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <Clock className="w-3 h-3 text-emerald-500" />
                    <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">Cycle: 3 Jours</span>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-white/40">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Statut</span>
                    </div>
                    <p className="text-xs font-bold text-white uppercase">Moteur Opérationnel</p>
                </div>

                <div className="md:col-span-2">
                    <button
                        onClick={handleTrigger}
                        disabled={loading}
                        className="w-full h-full py-4 bg-primary text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-primary/20"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Forcer une Nouvelle Réflexion (IA)
                    </button>
                </div>
            </div>

            <p className="text-[9px] text-white/20 font-medium uppercase tracking-tighter italic">
                * Le système utilise l'API Groq pour générer des articles sur la tech, le mode et le luxe de manière ultra-réaliste.
            </p>
        </motion.div>
    );
}
