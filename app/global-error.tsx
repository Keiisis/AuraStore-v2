"use client";

import "./globals.css";
import React from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    React.useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="fr" className="dark">
            <body className="bg-[#050505] text-white min-h-screen flex items-center justify-center font-sans">
                <div className="max-w-md w-full p-6 text-center space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tighter">
                            AURA<span className="text-[#FE7501]">STORE</span>
                        </h1>
                        <div className="h-1 w-12 bg-[#FE7501] mx-auto rounded-full" />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-white/80">
                            Arrêt Critique
                        </h2>
                        <p className="text-sm text-white/40 leading-relaxed font-medium">
                            Une erreur système majeure a été détectée. L'application doit être redémarrée pour garantir l'intégrité des données.
                        </p>
                        {error.digest && (
                            <code className="block bg-white/5 p-2 rounded text-[10px] font-mono text-white/30">
                                {error.digest}
                            </code>
                        )}
                    </div>

                    <button
                        onClick={() => reset()}
                        className="w-full py-4 bg-[#FE7501] text-black font-black uppercase tracking-widest rounded-xl hover:bg-[#FF8A2E] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(254,117,1,0.3)]"
                    >
                        Redémarrage Système
                    </button>
                </div>
            </body>
        </html>
    );
}
