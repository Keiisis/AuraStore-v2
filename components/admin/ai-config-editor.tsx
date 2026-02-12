"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Save,
    Loader2,
    Cpu,
    Key,
    Database,
    Zap,
    Infinity as InfinityIcon,
    ShieldCheck,
    Bot
} from "lucide-react";
import { toast } from "sonner";

export function AIConfigEditor() {
    const [config, setConfig] = useState<any>({
        provider: "fal",
        fal_key: "",
        replicate_key: "",
        groq_key: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/admin/ai-config")
            .then(res => res.json())
            .then(data => {
                if (data.config) setConfig(data.config);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/ai-config", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Configuration Master Synchronisée");
            } else {
                toast.error(data.error || "Échec de la synchronisation");
            }
        } catch (err: any) {
            toast.error("Erreur de liaison réseau: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="p-24 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 animate-pulse">Scanning Neural Links...</span>
        </div>
    );

    return (
        <div className="grid lg:grid-cols-5 gap-8">
            {/* Main Power Core */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-3 bg-[#0A0A0C] border border-white/5 rounded-[2.5rem] p-10 space-y-10 relative overflow-hidden"
            >
                {/* Header Logic */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 relative group">
                            <Cpu className="w-7 h-7 text-primary relative z-10 group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Moteur VTO Intelligent</h3>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Configuration des infrastructures IA de calcul</p>
                        </div>
                    </div>
                </div>

                {/* Source Selection Core */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Source de Puissance Active</label>
                        <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-primary animate-pulse" />
                            <span className="text-[8px] font-black text-primary uppercase tracking-widest">High Energy Mode</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-1.5 bg-black/60 rounded-[1.5rem] border border-white/5">
                        <button
                            onClick={() => setConfig({ ...config, provider: 'fal' })}
                            className={`relative py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all overflow-hidden ${config.provider === 'fal' ? 'text-black' : 'text-white/30 hover:text-white/60'}`}
                        >
                            {config.provider === 'fal' && (
                                <motion.div layoutId="active-bg" className="absolute inset-0 bg-primary shadow-lg shadow-primary/20" />
                            )}
                            <span className="relative z-10">FAL.AI (Ultra-Fast)</span>
                        </button>
                        <button
                            onClick={() => setConfig({ ...config, provider: 'replicate' })}
                            className={`relative py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all overflow-hidden ${config.provider === 'replicate' ? 'text-black' : 'text-white/30 hover:text-white/60'}`}
                        >
                            {config.provider === 'replicate' && (
                                <motion.div layoutId="active-bg" className="absolute inset-0 bg-primary shadow-lg shadow-primary/20" />
                            )}
                            <span className="relative z-10">REPLICATE (Stable)</span>
                        </button>
                    </div>
                </div>

                {/* Dynamic Key Form */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={config.provider}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        <div className="p-8 rounded-[2rem] bg-black/40 border border-white/5 space-y-5 relative">
                            <div className="flex items-center gap-3 mb-2">
                                <Key className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Liaison API : {config.provider.toUpperCase()}</span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] pl-1">Configuration {config.provider === 'fal' ? 'FAL_KEY' : 'REPLICATE_TOKEN'}</label>
                                <input
                                    type="password"
                                    value={config.provider === 'fal' ? (config.fal_key || "") : (config.replicate_key || "")}
                                    onChange={e => {
                                        const field = config.provider === 'fal' ? 'fal_key' : 'replicate_key';
                                        setConfig({ ...config, [field]: e.target.value });
                                    }}
                                    placeholder={config.provider === 'fal' ? "fal_..." : "r8_..."}
                                    className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:border-primary/50 outline-none transition-all font-mono"
                                />
                            </div>

                            {/* Provider Specific Badge */}
                            <div className="absolute top-6 right-6 px-3 py-1 rounded-full border border-white/5 bg-white/5 text-[9px] font-black text-white/20 tracking-tighter italic uppercase">
                                System Isolated
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Plume IA Section (Separate Logic) */}
                <div className="pt-4 space-y-6">
                    <div className="flex items-center gap-3">
                        <Bot className="w-4 h-4 text-indigo-400" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Plume IA : Intelligence Créative</span>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-indigo-500/[0.02] border border-indigo-500/10 space-y-5">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center pr-1">
                                <label className="text-[9px] font-black text-indigo-400/40 uppercase tracking-[0.2em]">GROQ_API_KEY</label>
                                <span className="text-[8px] font-black text-indigo-400/20 uppercase tracking-widest italic">Autonomous Blog Logic</span>
                            </div>
                            <input
                                type="password"
                                value={config.groq_key || ""}
                                onChange={e => setConfig({ ...config, groq_key: e.target.value })}
                                placeholder="gsk_..."
                                className="w-full bg-black/60 border border-indigo-500/10 rounded-2xl px-6 py-4 text-white text-sm focus:border-indigo-500/40 outline-none transition-all font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Controller */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-5 bg-white text-black font-black uppercase text-xs tracking-[0.4em] rounded-[1.5rem] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-2xl"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    Injecter la Configuration
                </button>

                {/* Decor Glow */}
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            </motion.div>

            {/* Neural Dashboard (Status Visualizer) */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 space-y-6"
            >
                <div className="bg-[#0A0A0C] border border-white/5 rounded-[2.5rem] p-10 h-full flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full animate-pulse" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            className="relative w-32 h-32 rounded-full border-2 border-dashed border-primary/20 flex items-center justify-center"
                        >
                            <div className="w-24 h-24 rounded-full border border-white/5 flex items-center justify-center bg-black/40 backdrop-blur-xl">
                                <InfinityIcon className="w-10 h-10 text-primary opacity-40 animate-pulse" />
                            </div>
                        </motion.div>

                        {/* Dynamic Floating Nodes */}
                        {[0, 1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    y: [0, -10, 0],
                                    opacity: [0.2, 0.5, 0.2]
                                }}
                                transition={{
                                    duration: 3 + i,
                                    repeat: Infinity,
                                    delay: i * 0.5
                                }}
                                className="absolute w-2 h-2 rounded-full bg-primary"
                                style={{
                                    top: `${20 + i * 20}%`,
                                    left: `${10 + i * 25}%`
                                }}
                            />
                        ))}
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="space-y-1">
                            <p className="text-white font-black uppercase italic tracking-tighter text-lg">Nexus IA : En Ligne</p>
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Protocoles Optimisés</span>
                            </div>
                        </div>

                        <div className="h-px bg-white/5 w-24 mx-auto" />

                        <p className="text-[10px] text-white/40 font-medium leading-relaxed uppercase tracking-widest max-w-[200px] mx-auto italic">
                            AuraStore exploite actuellement la puissance de <span className="text-primary font-black">{config.provider.toUpperCase()}</span> pour le rendu <span className="text-white">vto-next-gen</span>.
                        </p>
                    </div>

                    {/* Ambient Grid Background for this card */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                    />
                </div>
            </motion.div>
        </div>
    );
}
