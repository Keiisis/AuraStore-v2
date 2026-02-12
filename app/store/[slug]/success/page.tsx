"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Download, Home, ShoppingBag, ArrowRight, Printer, Share2, Loader2, Package, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCart } from "@/components/store/cart-context";
import { formatPrice } from "@/lib/currency-engine";
import { getOrderBySessionId } from "@/lib/actions/order";

export default function SuccessPage() {
    const { slug } = useParams();
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    const sessionId = searchParams.get("session_id");

    useEffect(() => {
        setMounted(true);
        clearCart();

        if (sessionId) {
            fetchOrder();
        } else {
            setLoading(false);
        }
    }, [sessionId]);

    async function fetchOrder() {
        if (!sessionId) return;
        setLoading(true);
        const result = await getOrderBySessionId(sessionId);
        if (result.order) {
            setOrder(result.order);
        }
        setLoading(false);
    }

    if (!mounted) return null;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#FE7501] animate-spin" />
            </div>
        );
    }

    const orderId = order?.id?.slice(-8).toUpperCase() || "ORD-PENDING";
    const date = order?.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString();
    const storeData = order?.stores || {};
    const items = order?.items || [];
    const total = order?.total || 0;

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center py-12 px-6 font-sans">
            {/* Ambient Lighting */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FE7501] opacity-[0.03] blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FE7501] opacity-[0.02] blur-[150px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl w-full space-y-12 relative z-10"
            >
                {/* Header Section */}
                <div className="text-center space-y-6">
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-20 h-20 bg-[#FE7501] rounded-[24px] flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(254,117,1,0.25)]"
                    >
                        <ShieldCheck className="w-10 h-10 text-black" strokeWidth={2.5} />
                    </motion.div>

                    <div className="space-y-2">
                        <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase">
                            Commande Validée
                        </h1>
                        <p className="text-[#FE7501] font-bold tracking-[0.3em] text-[10px] uppercase">
                            Signature Aura Digital Loop
                        </p>
                    </div>
                </div>

                {/* THE PROFESSIONAL INVOICE */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative group"
                >
                    {/* Decorative Border Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-white/20 to-transparent rounded-[40px] blur-sm opacity-50 group-hover:opacity-70 transition-opacity" />

                    <div className="relative bg-[#0A0A0C] rounded-[38px] overflow-hidden border border-white/10 shadow-3xl">
                        {/* Status Ribbon */}
                        <div className="absolute top-8 -right-12 rotate-45 bg-[#FE7501] text-black text-[10px] font-black uppercase tracking-[0.2em] py-1.5 px-12 shadow-lg">
                            Délivré
                        </div>

                        {/* Invoice Header */}
                        <div className="p-10 sm:p-12 border-b border-white/5 bg-white/[0.01]">
                            <div className="flex flex-col sm:flex-row justify-between gap-8 items-start">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-black text-sm">
                                            {storeData.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black uppercase tracking-widest">{storeData.name || "Aura Store"}</h2>
                                            <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest leading-none mt-1">Émetteur Officiel</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-white/40 font-medium space-y-1">
                                        <p>{storeData.address || "Zone Industrielle Aura"}</p>
                                        <p>{storeData.phone || "+225 -- -- -- --"}</p>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right space-y-1">
                                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-black">Facture N°</p>
                                    <p className="text-2xl font-mono font-black text-white">{orderId}</p>
                                    <p className="text-[10px] text-[#FE7501] font-bold uppercase">{date}</p>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Body */}
                        <div className="p-10 sm:p-12 space-y-12">
                            {/* Confirmation Note */}
                            <div className="bg-[#FE7501]/5 border border-[#FE7501]/20 p-6 rounded-3xl flex items-center gap-5">
                                <div className="p-3 bg-[#FE7501]/10 rounded-2xl">
                                    <Package className="w-6 h-6 text-[#FE7501]" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Confirmation de Livraison</p>
                                    <p className="text-xs text-white/50">Votre article a été officiellement enregistré comme <span className="text-[#FE7501] font-bold italic">Délivré</span> dans notre système.</p>
                                </div>
                            </div>

                            {/* Customer & Shipping */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-black">Destinataire</p>
                                    <div className="space-y-1">
                                        <p className="text-lg font-bold text-white leading-none">{order?.customer_name || "Client Aura"}</p>
                                        <p className="text-sm text-white/40">{order?.customer_email}</p>
                                        <p className="text-sm text-white/40">{order?.customer_phone}</p>
                                    </div>
                                </div>
                                <div className="space-y-4 sm:text-right">
                                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-black">Adresse de Livraison</p>
                                    <p className="text-sm text-white/40 max-w-[200px] ml-auto">
                                        {typeof order?.shipping_address === 'string' ? order.shipping_address : order?.shipping_address?.address || "Retrait comptoir"}
                                    </p>
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-center px-2">
                                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-black">Articles commandés</p>
                                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-black">Prix Unitaire</p>
                                </div>
                                <div className="divide-y divide-white/5 border-t border-b border-white/5">
                                    {items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center py-6 group">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-[#FE7501]/30 transition-colors overflow-hidden">
                                                    {item.image ? (
                                                        <img src={item.image} alt="" className="w-full h-full object-cover opacity-80" />
                                                    ) : (
                                                        <ShoppingBag className="w-6 h-6 text-white/10" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-base leading-none mb-1">{item.name}</p>
                                                    <p className="text-xs text-white/30 tracking-tight">Quantité: {item.quantity || 1} {item.variant ? `• ${item.variant}` : ''}</p>
                                                </div>
                                            </div>
                                            <p className="font-mono text-white/80 font-bold">{formatPrice(item.price * (item.quantity || 1), 'xof')}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="flex flex-col items-end space-y-4">
                                <div className="w-full sm:w-64 space-y-3">
                                    <div className="flex justify-between items-center px-4">
                                        <span className="text-white/40 text-[11px] font-bold uppercase tracking-wider">Sous-total</span>
                                        <span className="text-white/80 font-mono text-sm">{formatPrice(order?.subtotal || 0, 'xof')}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-4">
                                        <span className="text-white/40 text-[11px] font-bold uppercase tracking-wider">TVA (0%)</span>
                                        <span className="text-white/80 font-mono text-sm">0 FCFA</span>
                                    </div>
                                    <div className="flex justify-between items-center p-6 bg-white/[0.03] rounded-[24px] border border-white/5 mt-6 group hover:border-[#FE7501]/40 transition-all shadow-lg">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-[#FE7501]">Total Payé</span>
                                        <span className="text-2xl font-black text-white font-mono">{formatPrice(total, 'xof')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="p-10 border-t border-white/5 bg-white/[0.01] flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => window.print()}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                >
                                    <Printer className="w-4 h-4" /> Imprimer
                                </button>
                                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 p-4 bg-white text-black hover:scale-105 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                                    <Download className="w-4 h-4" /> Sauvegarder
                                </button>
                            </div>
                            <div className="flex items-center gap-3 opacity-30">
                                <div className="text-right">
                                    <p className="text-[8px] font-black uppercase tracking-widest leading-none">Aura Cloud Nodes</p>
                                    <p className="text-[7px] font-bold tracking-[0.3em] uppercase">Auth Token Verified</p>
                                </div>
                                <div className="w-px h-8 bg-white/20" />
                                <Share2 className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Post-Purchase Flow */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Link
                        href={`/store/${slug}`}
                        className="group flex items-center justify-center gap-4 px-10 py-5 bg-[#121214] border border-white/10 rounded-2xl hover:bg-white/5 transition-all"
                    >
                        <Home className="w-4 h-4 text-white/40 group-hover:text-[#FE7501] transition-colors" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em]">Quitter le flux</span>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
