import { Sparkles, Brain, Cpu, Zap, BarChart3, Database } from "lucide-react";

export default function AdminAiLabPage() {
    return (
        <div className="space-y-10">
            <div className="space-y-1">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-primary" />
                    AI Training Lab
                </h2>
                <p className="text-[11px] text-white/30 font-bold uppercase tracking-[0.2em]">Neural Engine Optimization & Platform Intelligence</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Core Brain Status */}
                <div className="volcanic-glass p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <Brain className="w-6 h-6 text-primary" />
                        <h3 className="text-lg font-black text-white uppercase italic">Aura Core Intelligence</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                            <p className="text-[9px] text-white/20 font-black uppercase">Model Instance</p>
                            <p className="text-xs text-white font-bold uppercase">Llama-3.3-70B</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                            <p className="text-[9px] text-white/20 font-black uppercase">Quantization</p>
                            <p className="text-xs text-white font-bold uppercase">FP16 / Optimized</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                            <span className="text-white/40">Cognitive Load</span>
                            <span className="text-emerald-400">12%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[12%]" />
                        </div>
                    </div>

                    <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl border border-white/5 transition-all">
                        Recalibrate Neural Weights
                    </button>
                </div>

                {/* Training Data */}
                <div className="volcanic-glass p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <Database className="w-6 h-6 text-blue-400" />
                        <h3 className="text-lg font-black text-white uppercase italic">Datasets & Context</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="flex items-center gap-3">
                                <Zap className="w-4 h-4 text-primary" />
                                <span className="text-xs font-bold text-white uppercase">Product Catalogues</span>
                            </div>
                            <span className="text-[10px] text-white/30 font-black">4.2MB</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="flex items-center gap-3">
                                <Zap className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-bold text-white uppercase">Sales Psychology</span>
                            </div>
                            <span className="text-[10px] text-white/30 font-black">1.1MB</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-[10px] text-primary/60 font-medium uppercase tracking-tighter leading-relaxed">
                            Aura Brain is automatically fine-tuned based on store interactions and sales feedback loops.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
