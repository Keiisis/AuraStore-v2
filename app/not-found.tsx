import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-volcanic-radial opacity-20 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />

            <div className="relative z-10 glass-card p-12 rounded-[3rem] border border-white/10 max-w-lg w-full flex flex-col items-center gap-6 shadow-[0_0_100px_rgba(254,117,1,0.1)]">

                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2 animate-blob-pulse">
                    <AlertTriangle className="w-10 h-10 text-primary" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-6xl font-display font-black text-white">404</h1>
                    <h2 className="text-2xl font-bold text-white/80">Page Introuvable</h2>
                </div>

                <p className="text-white/40 text-sm leading-relaxed max-w-sm">
                    Il semble que cette page ait disparu dans le néant digital. Vérifiez l'URL ou retournez en lieu sûr.
                </p>

                <div className="pt-4 w-full">
                    <Link
                        href="/"
                        className="w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour à l'accueil
                    </Link>
                </div>
            </div>

            <footer className="absolute bottom-8 text-white/10 text-[10px] uppercase tracking-[0.3em] font-black">
                AuraStore System
            </footer>
        </div>
    );
}
