"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen w-full bg-[#08080A] flex flex-col items-center justify-center p-6 text-center select-none">
            {/* Visual */}
            <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-1000" />
                <div className="relative w-24 h-24 bg-[#121216] border border-red-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)] animate-in zoom-in duration-500">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
            </div>

            {/* Content */}
            <div className="max-w-md w-full space-y-4 mb-10 animate-in slide-in-from-bottom-4 duration-700 delay-100">
                <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight">
                    Interruption Système
                </h2>
                <p className="text-white/40 font-medium leading-relaxed">
                    Une erreur inattendue a stoppé le processus. Nos protocoles de sécurité ont isolé l'incident.
                </p>
                {/* Technical Details (Hidden for style but visible if needed) */}
                <div className="h-px w-16 bg-white/10 mx-auto my-4" />
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                    Code: {error.digest || "UNKNOWN_ERROR"}
                </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs animate-in slide-in-from-bottom-4 duration-700 delay-200">
                <button
                    onClick={reset}
                    className="flex-1 h-12 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Relancer
                </button>
                <Link
                    href="/"
                    className="flex-1 h-12 bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                >
                    <Home className="w-4 h-4" />
                    Accueil
                </Link>
            </div>
        </div>
    );
}
