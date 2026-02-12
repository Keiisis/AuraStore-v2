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
            const result = await getOrderBySessionId(sessionId);
            if (result.order) {
                setOrder(result.order);
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
    const store = order?.stores || {};
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
        <div className="min-h-screen text-white font-sans py-12 px-4 sm:px-8">
            <div className="relative z-10 max-w-[820px] mx-auto space-y-10">

                {/* ═══════════════════════════════════════════ */}
                {/*  HEADER – Confirmation visuelle             */}
                {/* ═══════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-5"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10, stiffness: 150, delay: 0.15 }}
                        className="w-[72px] h-[72px] bg-[#FE7501] rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_80px_rgba(254,117,1,0.25)] rotate-3"
                    >
                        <ShieldCheck className="w-9 h-9 text-black" strokeWidth={2.5} />
                    </motion.div>

                    <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
                        Paiement Confirmé
                    </h1>

                    {/* AI Thank You Message */}
                    <div className="flex items-start gap-3 max-w-xl mx-auto text-left bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                        <Sparkles className="w-5 h-5 text-[#FE7501] mt-0.5 shrink-0" />
                        <p className="text-[13px] leading-relaxed text-white/60">{thankYouMsg}</p>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════ */}
                {/*  FACTURE PROFESSIONNELLE                    */}
                {/* ═══════════════════════════════════════════ */}
                <motion.div
                    ref={invoiceRef}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-[#0C0C10] border border-white/[0.08] rounded-[28px] overflow-hidden shadow-2xl print:shadow-none print:border-black/20"
                >
                    {/* ── Top Bar: Store + Invoice Number ── */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6 p-8 sm:p-10 border-b border-white/[0.06] bg-white/[0.015]">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                {store.logo_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={store.logo_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                                ) : (
                                    <div className="w-10 h-10 bg-[#FE7501] rounded-xl flex items-center justify-center text-black font-black text-lg">
                                        {storeName.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-wider leading-none">{storeName}</h2>
                                    <p className="text-[9px] text-white/25 font-bold uppercase tracking-[0.25em] mt-0.5">Facture officielle</p>
                                </div>
                            </div>
                            {(store.address || store.phone || store.email) && (
                                <div className="text-[11px] text-white/30 space-y-0.5 ml-[52px]">
                                    {store.address && <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{store.address}</p>}
                                    {store.phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{store.phone}</p>}
                                    {store.email && <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{store.email}</p>}
                                </div>
                            )}
                        </div>

                        <div className="sm:text-right space-y-2 shrink-0">
                            <div className="flex items-center gap-2 sm:justify-end">
                                <Hash className="w-3.5 h-3.5 text-white/20" />
                                <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Facture</span>
                            </div>
                            <p className="text-xl font-mono font-black tracking-tight">{invoiceNumber}</p>
                            <div className="space-y-0.5">
                                <p className="text-[11px] text-white/40 flex items-center gap-1.5 sm:justify-end">
                                    <Calendar className="w-3 h-3" />{orderDate}
                                </p>
                                {orderTime && (
                                    <p className="text-[10px] text-white/25">{orderTime}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Body ── */}
                    <div className="p-8 sm:p-10 space-y-10">

                        {/* Delivery Status Banner */}
                        <div className="flex items-center gap-4 p-5 bg-green-500/[0.06] border border-green-500/20 rounded-2xl">
                            <div className="w-11 h-11 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
                                <Package className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-[13px] font-bold text-green-300">Commande enregistrée — En préparation</p>
                                <p className="text-[11px] text-white/40 leading-relaxed mt-0.5">{deliveryNote}</p>
                            </div>
                            <div className="ml-auto hidden sm:flex items-center gap-1.5 bg-green-500/10 px-3 py-1.5 rounded-lg shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                <span className="text-[10px] font-black text-green-300 uppercase tracking-wider">Validé</span>
                            </div>
                        </div>

                        {/* Customer & Payment Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">Facturé à</p>
                                <div className="space-y-1.5">
                                    <p className="text-base font-bold text-white">{customerName}</p>
                                    {customerEmail && (
                                        <p className="text-xs text-white/40 flex items-center gap-1.5">
                                            <Mail className="w-3 h-3 text-white/20" />{customerEmail}
                                        </p>
                                    )}
                                    {customerPhone && (
                                        <p className="text-xs text-white/40 flex items-center gap-1.5">
                                            <Phone className="w-3 h-3 text-white/20" />{customerPhone}
                                        </p>
                                    )}
                                    {shippingAddress && (
                                        <p className="text-xs text-white/40 flex items-center gap-1.5">
                                            <MapPin className="w-3 h-3 text-white/20" />{shippingAddress}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-3 sm:text-right">
                                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">Mode de paiement</p>
                                <div className="flex items-center gap-2 sm:justify-end">
                                    <CreditCard className="w-4 h-4 text-[#FE7501]/60" />
                                    <span className="text-sm font-bold text-white capitalize">{paymentMethod === "stripe" ? "Carte bancaire (Stripe)" : paymentMethod}</span>
                                </div>
                                <p className="text-[10px] text-green-400/80 font-bold uppercase tracking-wider">Payé intégralement</p>
                            </div>
                        </div>

                        {/* ── Line Items Table ── */}
                        <div className="space-y-0">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-[9px] font-black text-white/20 uppercase tracking-[0.2em] border-b border-white/[0.06]">
                                <span className="col-span-6 sm:col-span-7">Article</span>
                                <span className="col-span-2 text-center">Qté</span>
                                <span className="col-span-4 sm:col-span-3 text-right">Total</span>
                            </div>

                            {/* Table Body */}
                            <div className="divide-y divide-white/[0.04]">
                                {items.length > 0 ? items.map((item: any, idx: number) => {
                                    const itemPrice = Number(item.price) || 0;
                                    const itemQty = Number(item.quantity) || 1;
                                    const lineTotal = itemPrice * itemQty;

                                    return (
                                        <div key={idx} className="grid grid-cols-12 gap-4 px-4 py-5 items-center group hover:bg-white/[0.015] transition-colors rounded-xl">
                                            <div className="col-span-6 sm:col-span-7 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden shrink-0 group-hover:border-[#FE7501]/30 transition-colors">
                                                    {item.image ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ShoppingBag className="w-4 h-4 text-white/10" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-white truncate">{item.name || "Article"}</p>
                                                    <p className="text-[10px] text-white/30 mt-0.5">
                                                        {formatPrice(itemPrice, "XOF")} / unité
                                                        {item.variant ? ` • ${item.variant}` : ""}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-center">
                                                <span className="text-sm font-bold text-white/70">×{itemQty}</span>
                                            </div>
                                            <div className="col-span-4 sm:col-span-3 text-right">
                                                <span className="text-sm font-bold text-white">{formatPrice(lineTotal, "XOF")}</span>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center py-10 text-white/20 text-sm">
                                        Aucun article trouvé pour cette commande.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Totals ── */}
                        <div className="flex justify-end">
                            <div className="w-full sm:w-72 space-y-3">
                                <div className="flex justify-between items-center text-sm px-4">
                                    <span className="text-white/40">Sous-total</span>
                                    <span className="text-white/80 font-mono">{formatPrice(subtotal, "XOF")}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm px-4">
                                    <span className="text-white/40">Livraison</span>
                                    <span className="text-white/60 font-mono">Gratuite</span>
                                </div>
                                <div className="flex justify-between items-center text-sm px-4">
                                    <span className="text-white/40">TVA</span>
                                    <span className="text-white/60 font-mono">0 %</span>
                                </div>
                                <div className="h-px bg-white/[0.06] mx-4" />
                                <div className="flex justify-between items-center p-5 bg-[#FE7501]/[0.06] border border-[#FE7501]/20 rounded-2xl">
                                    <span className="text-xs font-black uppercase tracking-widest text-[#FE7501]">Total TTC</span>
                                    <span className="text-xl font-black text-white font-mono">{formatPrice(total, "XOF")}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Invoice Footer ── */}
                    <div className="px-8 sm:px-10 py-6 border-t border-white/[0.06] bg-white/[0.01] flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex gap-3">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-5 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all"
                            >
                                <Printer className="w-3.5 h-3.5" /> Imprimer
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-5 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:scale-[1.03] transition-all"
                            >
                                <Download className="w-3.5 h-3.5" /> Télécharger
                            </button>
                        </div>
                        <p className="text-[8px] text-white/15 font-bold uppercase tracking-[0.3em] text-center sm:text-right">
                            {storeName} — Document généré automatiquement
                        </p>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════ */}
                {/*  CALL TO ACTION                            */}
                {/* ═══════════════════════════════════════════ */}
                <div className="flex justify-center pt-4">
                    <Link
                        href={`/store/${slug}`}
                        className="group flex items-center gap-3 px-8 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl hover:bg-white/[0.06] transition-all"
                    >
                        <Home className="w-4 h-4 text-white/30 group-hover:text-[#FE7501] transition-colors" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60 group-hover:text-white transition-colors">
                            Continuer mes achats
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
