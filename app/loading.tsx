import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-volcanic-radial opacity-10 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* Logo Pulse Animation */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping opacity-20" />
                    <div className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(254,117,1,0.4)]">
                        <span className="font-display font-black text-2xl text-white">A</span>
                    </div>
                </div>

                <div className="space-y-2 text-center">
                    <h3 className="text-white font-bold text-lg tracking-widest uppercase animate-pulse">Chargement</h3>
                    <p className="text-white/30 text-[10px] uppercase tracking-[0.3em]">Initialisation du système</p>
                </div>
            </div>
        </div>
    );
}
