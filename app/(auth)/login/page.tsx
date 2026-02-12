"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, signUp } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, ArrowRight, UserPlus, LogIn, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            if (isLogin) {
                await signIn({ email, password });
                // The server action redirects on success, so no code here will run
            } else {
                const res = await signUp({ email, password });
                if (res.error) throw new Error(res.error);
                setSuccess(res.message || "Success!");
            }
        } catch (err: any) {
            // Next.js redirection throws an error type "NEXT_REDIRECT" that we must ignore/allow
            if (err.message === "NEXT_REDIRECT" || err.message?.includes("NEXT_REDIRECT")) {
                return; // Let the redirect happen
            }
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#050505]">
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-blob-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-blob-pulse [animation-delay:2s]" />
            </div>

            <Link href="/" className="absolute top-8 left-8 text-white/40 hover:text-white flex items-center gap-2 transition-colors z-50">
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Retour</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[440px] relative z-10"
            >
                <div className="volcanic-glass p-10 overflow-hidden relative">
                    {/* Interior Glows */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />

                    <div className="relative z-10 space-y-8">
                        <div className="text-center space-y-3">
                            <motion.div
                                layoutId="auth-icon"
                                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary p-4 mx-auto shadow-2xl shadow-primary/20 flex items-center justify-center"
                            >
                                {isLogin ? <LogIn className="text-white w-8 h-8" /> : <UserPlus className="text-white w-8 h-8" />}
                            </motion.div>

                            <h1 className="font-display text-3xl font-black text-white tracking-tight">
                                {isLogin ? "Bon retour !" : "Rejoignez l'élite"}
                            </h1>
                            <p className="text-sm text-white/40 font-medium">
                                {isLogin ? "Accédez à votre empire digital" : "Créez votre boutique IA en 30 secondes"}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-4">
                                <div className="space-y-1.5 px-1">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="votre@email.com"
                                            className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 px-1">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Mot de passe</label>
                                        {isLogin && <button type="button" className="text-[10px] font-bold text-primary/60 hover:text-primary uppercase tracking-widest transition-colors">Oublié ?</button>}
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-xs font-bold text-red-400"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-xs font-bold text-green-400"
                                    >
                                        {success}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                    <>
                                        {isLogin ? "Se Connecter" : "Créer le compte"}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="pt-4 text-center">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-xs font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors"
                            >
                                {isLogin ? "Nouveau ici ? Créer un compte" : "Déjà membre ? Se connecter"}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}
