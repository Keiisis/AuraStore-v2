"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Download, Home, ShoppingBag, ArrowRight, Printer, Share2 } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCart } from "@/components/store/cart-context";
import { formatPrice } from "@/lib/currency-engine";

export default function SuccessPage() {
    const { slug } = useParams();
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    const [mounted, setMounted] = useState(false);

    // Simulation de données de facture (en attendant la récup DB)
    const orderId = searchParams.get("session_id")?.slice(-8).toUpperCase() || "AURA-777";
    const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    useEffect(() => {
        setMounted(true);
        clearCart(); // Vider le panier au succès
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans">
            {/* Background Aura Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FE7501] opacity-[0.05] blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full space-y-8 relative z-10"
            >
                {/* Header Success Section */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                        className="w-24 h-24 bg-gradient-to-tr from-[#FE7501] to-[#FFB371] rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(254,117,1,0.3)]"
                    >
                        <CheckCircle2 className="w-12 h-12 text-black" strokeWidth={3} />
                    </motion.div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase whitespace-nowrap">
                        Achat Confirmé
                    </h1>
                    <p className="text-white/40 font-medium tracking-widest text-sm uppercase">
                        Merci pour votre confiance. Votre commande est en préparation.
                    </p>
                </div>

                {/* THE "EXCEPTIONAL" DYNAMIC INVOICE */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-xl shadow-2xl"
                >
                    {/* Invoice Top Bar */}
                    <div className="bg-gradient-to-r from-white/5 to-transparent p-8 flex justify-between items-start border-b border-white/5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#FE7501] rounded-lg rotate-12 flex items-center justify-center text-black font-black text-xs">A</div>
                                <span className="text-xl font-black uppercase tracking-widest">Aura Store</span>
                            </div>
                            <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">Official Invoice</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Numéro de Commande</p>
                            <p className="text-xl font-mono text-[#FE7501]">{orderId}</p>
                        </div>
                    </div>

                    {/* Invoice Body */}
                    <div className="p-8 space-y-10">
                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <p className="text-[10px] text-white/20 uppercase tracking-widest font-black">Détails de facturation</p>
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-white/80">Kevin Chacha</p>
                                    <p className="text-sm text-white/40">Abidjan, Côte d'Ivoire</p>
                                    <p className="text-sm text-white/40">+225 07 00 00 00 00</p>
                                </div>
                            </div>
                            <div className="space-y-4 text-right">
                                <p className="text-[10px] text-white/20 uppercase tracking-widest font-black">Date d'émission</p>
                                <p className="text-lg font-bold text-white/80">{date}</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="space-y-4">
                            <div className="flex justify-between text-[10px] text-white/20 uppercase tracking-widest font-black px-4">
                                <span>Description</span>
                                <span>Total</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-black rounded-lg border border-white/10" />
                                        <div>
                                            <p className="font-bold text-white">Produit Premium Aura</p>
                                            <p className="text-xs text-white/30 italic">Edition Limitée</p>
                                        </div>
                                    </div>
                                    <p className="font-mono text-[#FE7501]">5.000 FCFA</p>
                                </div>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="space-y-2 pt-6 border-t border-white/5">
                            <div className="flex justify-between items-center px-4">
                                <span className="text-white/40 text-sm">Sous-total</span>
                                <span className="text-white/80 font-mono">5.000 FCFA</span>
                            </div>
                            <div className="flex justify-between items-center px-4">
                                <span className="text-white/40 text-sm">Frais de livraison</span>
                                <span className="text-white/80 font-mono">Gratuit</span>
                            </div>
                            <div className="flex justify-between items-center p-6 bg-white/[0.02] rounded-3xl mt-4 border border-white/5">
                                <span className="text-xl font-black uppercase tracking-widest">Total Payé</span>
                                <span className="text-3xl font-black text-[#FE7501] font-mono shadow-[0_0_30px_rgba(254,117,1,0.2)]">5.000 FCFA</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer / QR Simulation */}
                    <div className="p-8 bg-white/[0.01] flex justify-between items-center border-t border-white/5">
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-xs font-bold uppercase tracking-widest">
                                <Printer className="w-4 h-4" /> Imprimer
                            </button>
                            <button className="flex items-center gap-2 p-3 bg-black hover:bg-white/5 rounded-xl transition-all text-xs font-bold uppercase tracking-widest border border-white/10">
                                <Download className="w-4 h-4" /> PDF
                            </button>
                        </div>
                        <div className="flex flex-col items-end opacity-20">
                            <Share2 className="w-6 h-6 mb-1" />
                            <span className="text-[8px] font-black uppercase tracking-tighter">Verified by Aura Authentique</span>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href={`/store/${slug}`}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all text-sm group"
                    >
                        <Home className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> Retour à la boutique
                    </Link>
                    <Link
                        href={`/dashboard`}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-sm font-black uppercase tracking-widest"
                    >
                        Mes commandes <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <p className="text-center text-white/20 text-[10px] font-black uppercase tracking-[0.5em] pt-8">
                    &copy; 2026 Aura Technologies - Secure Luxury Payment Loop
                </p>
            </motion.div>
        </div>
    );
}
