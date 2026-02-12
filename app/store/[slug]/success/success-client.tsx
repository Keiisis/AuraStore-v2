"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
    CheckCircle2, Download, Home, ShoppingBag,
    Printer, Package, ShieldCheck, Loader2,
    MapPin, Phone, Mail, Calendar, Hash, CreditCard,
    Sparkles
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/components/store/cart-context";
import { formatPrice } from "@/lib/currency-engine";
import { getOrderBySessionId } from "@/lib/actions/order";

// ────────────────────────────────────────────
// AI-Written Personalized Messages
// ────────────────────────────────────────────
function generateThankYouMessage(customerName: string, itemCount: number, storeName: string): string {
    const first = customerName?.split(" ")[0] || "cher client";
    if (itemCount === 1) {
        return `Merci infiniment ${first} pour votre confiance. Votre commande a été enregistrée avec succès et notre équipe ${storeName} la prépare avec le plus grand soin. Vous recevrez une notification dès que votre article sera expédié.`;
    }
    return `${first}, merci pour cette belle commande de ${itemCount} articles ! L'équipe ${storeName} est ravie de vous compter parmi ses clients privilégiés. Chaque article est vérifié et emballé avec attention avant expédition.`;
}

function generateDeliveryNote(itemCount: number): string {
    if (itemCount === 1) {
        return "Votre article a été officiellement validé et enregistré dans notre système de suivi. Il sera préparé et expédié dans les meilleurs délais.";
    }
    return `Vos ${itemCount} articles ont été officiellement validés et enregistrés dans notre système de suivi. Ils seront préparés et expédiés dans les meilleurs délais.`;
}

// ────────────────────────────────────────────
// Client Content Component
// ────────────────────────────────────────────
export function SuccessClient({ sessionId, storeName: initialStoreName }: { sessionId?: string, storeName: string }) {
    const { slug } = useParams();
    const { clearCart } = useCart();
    const invoiceRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Security: clearCart MUST be called within the CartProvider context
        // This is safe here because SuccessClient is wrapped by StorefrontWrapper
        clearCart();

        if (sessionId) {
            fetchOrder();
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    async function fetchOrder() {
        if (!sessionId) return;
        setLoading(true);
        try {
            // Addition of a retry logic: order creation might have a slight delay
            let attempts = 0;
            let foundOrder = null;

            while (attempts < 3 && !foundOrder) {
                const result = await getOrderBySessionId(sessionId);
                if (result.order) {
                    foundOrder = result.order;
                } else {
                    attempts++;
                    if (attempts < 3) await new Promise(r => setTimeout(r, 1500));
                }
            }

            if (foundOrder) {
                setOrder(foundOrder);
            }
        } catch (e) {
            console.error("Failed to fetch order:", e);
        }
        setLoading(false);
    }

    if (!mounted) return null;

    // ── Loading State ──
    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-[#FE7501] animate-spin" />
                <p className="text-white/30 text-xs font-bold uppercase tracking-[0.3em]">
                    Chargement de votre facture...
                </p>
            </div>
        );
    }

    // ── Data Extraction ──
    const items: any[] = order?.items || [];

    // Handle Supabase join result (can be an object or an array of 1)
    const storeRaw = order?.stores;
    const store = Array.isArray(storeRaw) ? storeRaw[0] : (storeRaw || {});

    const storeName = store.name || initialStoreName || "Aura Store";
    const invoiceNumber = order?.id ? `INV-${order.id.slice(-8).toUpperCase()}` : "INV-000000";
    const orderDate = order?.created_at
        ? new Date(order.created_at).toLocaleDateString("fr-FR", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
        })
        : new Date().toLocaleDateString("fr-FR");
    const orderTime = order?.created_at
        ? new Date(order.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        : "";
    const subtotal = Number(order?.subtotal) || 0;
    const total = Number(order?.total) || 0;
    const customerName = order?.customer_name || "Client";
    const customerEmail = order?.customer_email || "";
    const customerPhone = order?.customer_phone || "";
    const shippingAddress = typeof order?.shipping_address === "object"
        ? order.shipping_address?.address
        : order?.shipping_address || "";
    const paymentMethod = order?.payment_method || "stripe";

    // AI Messages
    const thankYouMsg = generateThankYouMessage(customerName, items.length, storeName);
    const deliveryNote = generateDeliveryNote(items.length);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen text-black bg-[#F8F9FA] font-sans pt-12 pb-24 px-4 sm:px-8">
            <div className="relative z-10 max-w-[820px] mx-auto space-y-8">

                {/* Status Message */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-4 mb-8"
                >
                    <div className="w-16 h-16 bg-[#FE7501] rounded-full flex items-center justify-center shadow-xl shadow-[#FE7501]/20">
                        {loading ? (
                            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
                        ) : order ? (
                            <CheckCircle2 className="w-8 h-8 text-black" />
                        ) : (
                            <ShoppingBag className="w-8 h-8 text-black opacity-30" />
                        )}
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-black uppercase tracking-tight italic">
                            {loading ? "Recherche de votre commande..." : order ? "Commande Confirmée" : "Facture non trouvée"}
                        </h1>
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">
                            {order ? `Merci pour votre confiance chez ${storeName}` : "Nous n'avons pas pu charger les détails de votre achat"}
                        </p>

                        {!order && !loading && (
                            <div className="mt-4 flex flex-col items-center gap-2">
                                <button
                                    onClick={() => fetchOrder()}
                                    className="px-6 py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-all shadow-lg"
                                >
                                    Vérifier à nouveau
                                </button>
                                {sessionId && (
                                    <p className="text-[8px] text-gray-400 font-mono uppercase tracking-widest opacity-50">
                                        ID REF: {sessionId.slice(0, 14)}...
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ─── OFFICIAL INVOICE ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[2rem] shadow-[0_10px_50px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden"
                >
                    {/* Invoice Header */}
                    <div className="p-8 sm:p-12 space-y-10">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-8 border-b-2 border-black pb-8">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-widest leading-none">{storeName}</h2>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.25em] mt-2">Facture Officielle Aura</p>
                                <div className="mt-4 space-y-1 text-[11px] text-gray-500 font-medium">
                                    {store.address && <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 opacity-40" /> {store.address}</p>}
                                    {store.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 opacity-40" /> {store.phone}</p>}
                                </div>
                            </div>
                            <div className="sm:text-right">
                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">DÉTAILS FACTURE</p>
                                <p className="text-xl font-mono font-black">{invoiceNumber}</p>
                                <p className="text-[11px] text-gray-500 mt-1 uppercase font-bold">{orderDate}</p>
                                <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold">{orderTime}</p>
                            </div>
                        </div>

                        {/* Order Confirmation Banner */}
                        <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <Sparkles className="w-5 h-5 text-[#FE7501] shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-[11px] font-black uppercase tracking-widest text-[#FE7501]">Message de l'Intellignece Aura</p>
                                <p className="text-[13px] text-gray-600 leading-relaxed font-medium italic">"{thankYouMsg}"</p>
                            </div>
                        </div>

                        {/* Customer & Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">FACTURE À</p>
                                <div className="space-y-1.5">
                                    <p className="text-base font-bold text-gray-900">{customerName}</p>
                                    {customerEmail && <p className="text-xs text-gray-500 font-medium">{customerEmail}</p>}
                                    {customerPhone && <p className="text-xs text-gray-500 font-medium">{customerPhone}</p>}
                                    {shippingAddress && <p className="text-xs text-gray-500 font-medium italic mt-2 flex items-start gap-2"><MapPin className="w-3.5 h-3.5 mt-0.5 opacity-30 shrink-0" /> {shippingAddress}</p>}
                                </div>
                            </div>
                            <div className="sm:text-right">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">PAIEMENT & STATUT</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 sm:justify-end">
                                        <CreditCard className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-bold text-gray-800 capitalize">{paymentMethod === 'stripe' ? 'Carte Bancaire (Stripe)' : paymentMethod}</span>
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                        <CheckCircle2 className="w-3 h-3" /> Payé intégralement
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-xl text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">
                                <span className="col-span-8">Article</span>
                                <span className="col-span-1 text-center font-bold">Qté</span>
                                <span className="col-span-3 text-right">Total</span>
                            </div>
                            <div className="divide-y divide-gray-100 px-2">
                                {items.length > 0 ? items.map((item: any, i: number) => (
                                    <div key={i} className="grid grid-cols-12 gap-4 py-6 items-center">
                                        <div className="col-span-8 flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shrink-0">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-gray-200" /></div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{item.name || "Article"}</p>
                                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tight">
                                                    {formatPrice(Number(item.price) || 0, "XOF")} / u
                                                    {item.variant ? ` • ${item.variant}` : ""}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-span-1 text-center font-black text-xs text-gray-500">{item.quantity}</div>
                                        <div className="col-span-3 text-right font-mono font-black text-sm text-gray-900">
                                            {formatPrice((Number(item.price) || 0) * (Number(item.quantity) || 1), "XOF")}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-12 text-center text-[10px] text-gray-400 uppercase font-black tracking-widest">Aucun article enregistré</div>
                                )}
                            </div>
                        </div>

                        {/* Totals Section */}
                        <div className="flex flex-col sm:flex-row justify-between items-end gap-10 pt-8 border-t border-gray-100">
                            <div className="space-y-4 max-w-xs">
                                <p className="text-[10px] font-bold text-gray-400 leading-relaxed italic uppercase tracking-tighter">
                                    Note: {deliveryNote}
                                </p>
                            </div>
                            <div className="w-full sm:w-64 space-y-3">
                                <div className="flex justify-between items-center text-xs px-2">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Sous-total</span>
                                    <span className="font-mono font-bold text-gray-600">{formatPrice(subtotal, "XOF")}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs px-2">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Expédition</span>
                                    <span className="text-emerald-600 font-bold tracking-widest text-[9px] uppercase">Offerte</span>
                                </div>
                                <div className="pt-3 border-t-2 border-dashed border-gray-100">
                                    <div className="flex justify-between items-center p-5 bg-[#FE7501]/5 rounded-2xl border border-[#FE7501]/10">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#FE7501]">TOTAL TTC</span>
                                        <span className="text-2xl font-mono font-black text-[#FE7501]">{formatPrice(total, "XOF")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Badges */}
                    <div className="px-8 sm:px-12 py-8 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex gap-4">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
                            >
                                <Printer className="w-4 h-4" /> Imprimer
                            </button>
                            <button
                                onClick={() => {
                                    const text = `Bonjour ! Je viens de commander sur *${storeName}*.\n*Facture ${invoiceNumber}*\nTotal: ${formatPrice(total, "XOF")}\nMerci !`;
                                    window.open(`https://wa.me/${store.phone?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-emerald-500/10"
                            >
                                <Mail className="w-4 h-4 fill-current" /> Envoyer sur WhatsApp
                            </button>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] text-gray-300 font-black uppercase tracking-[0.3em] italic">Document généré automatiquement le {orderDate}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Return Home */}
                <div className="flex justify-center pt-8">
                    <Link
                        href={`/store/${slug}`}
                        className="flex items-center gap-3 px-8 py-5 bg-white border border-gray-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-black hover:border-black transition-all group"
                    >
                        <Home className="w-4 h-4 group-hover:text-[#FE7501]" /> Retour à la boutique
                    </Link>
                </div>
            </div>
        </div>
    );
}
