"use client";

import { formatPrice } from "@/lib/currency-engine";
import {
    Package, ShieldCheck, Zap, X, Printer, Download,
    MapPin, Phone, Mail, CreditCard,
    CheckCircle2, Sparkles, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InvoiceProps {
    order: any;
    storeName: string;
    isOpen?: boolean;
    onClose?: () => void;
}

function generateInvoiceMessage(order: any, storeName: string): string {
    const first = order.customer_name?.split(" ")[0] || "Client";
    const count = Array.isArray(order.items) ? order.items.length : 1;
    const status = order.status;

    if (status === "delivered") {
        return `${first}, votre commande a ete livree avec succes. Ce document fait office de justificatif de paiement et de preuve de livraison. L'equipe ${storeName} vous remercie pour votre confiance et reste a votre disposition pour toute question.`;
    }
    if (status === "shipped") {
        return `${first}, votre commande est actuellement en cours d'acheminement. Ce document constitue votre justificatif de paiement. Vous serez notifie des reception.`;
    }
    if (status === "confirmed") {
        return `${first}, votre paiement a ete confirme et votre commande est en cours de preparation. L'equipe ${storeName} prepare ${count > 1 ? "vos articles" : "votre article"} avec soin.`;
    }
    return `${first}, merci pour votre commande. Ce document est votre recu officiel. Votre paiement est en cours de verification par notre systeme securise.`;
}

function getStatusConfig(status: string) {
    switch (status) {
        case "delivered":
            return { label: "Livre", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 };
        case "shipped":
            return { label: "En transit", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: Package };
        case "confirmed":
            return { label: "Confirme", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: ShieldCheck };
        case "cancelled":
            return { label: "Annule", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: X };
        default:
            return { label: "En attente", color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", icon: Clock };
    }
}

export function Invoice({ order, storeName, isOpen = false, onClose }: InvoiceProps) {
    if (!isOpen) return null;

    const invoiceNumber = `INV-${order.id.slice(-8).toUpperCase()}`;
    const date = new Date(order.created_at).toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const time = new Date(order.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const items: any[] = Array.isArray(order.items) ? order.items : [];
    const total = Number(order.total) || 0;
    const subtotal = Number(order.subtotal) || total;
    const aiMessage = generateInvoiceMessage(order, storeName);
    const statusCfg = getStatusConfig(order.status);
    const StatusIcon = statusCfg.icon;
    const paymentLabel = order.payment_method === "stripe" ? "Carte bancaire (Stripe)" :
        order.payment_method === "whatsapp" ? "WhatsApp (Manuel)" :
            order.payment_method === "cash" ? "Especes" : order.payment_method;
    const shippingAddr = typeof order.shipping_address === "object"
        ? order.shipping_address?.address : order.shipping_address || "";

    const handlePrint = () => {
        const printContent = document.getElementById(`invoice-print-${order.id}`);
        if (!printContent) return;

        const w = window.open("", "_blank", "width=800,height=1100");
        if (!w) return;

        w.document.write(`<!DOCTYPE html><html><head><title>Facture ${invoiceNumber}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;color:#111;padding:48px;background:#fff}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #111}
.store-name{font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:2px}
.store-sub{font-size:9px;color:#999;text-transform:uppercase;letter-spacing:3px;margin-top:2px}
.inv-label{font-size:9px;color:#999;text-transform:uppercase;letter-spacing:3px;text-align:right}
.inv-number{font-size:20px;font-weight:900;font-family:monospace;margin-top:4px}
.inv-date{font-size:11px;color:#666;margin-top:4px}
.ai-box{display:flex;align-items:flex-start;gap:10px;padding:16px;background:#f9fafb;border:1px solid #f3f4f6;border-radius:12px;margin-bottom:32px}
.ai-icon{color:#FE7501;flex-shrink:0;margin-top:2px}
.ai-msg{font-size:11px;color:#666;line-height:1.6}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:32px}
.section-label{font-size:9px;font-weight:900;color:#999;text-transform:uppercase;letter-spacing:3px;margin-bottom:8px}
.client-name{font-size:16px;font-weight:700;margin-bottom:4px}
.client-detail{font-size:11px;color:#666;margin-bottom:2px}
.pay-label{font-size:13px;font-weight:700;margin-bottom:4px}
.pay-status{font-size:10px;color:#059669;font-weight:700;text-transform:uppercase;letter-spacing:2px}
table{width:100%;border-collapse:collapse;margin-bottom:32px}
thead tr{border-bottom:2px solid #111}
th{padding:12px 8px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#555}
th:first-child{text-align:left}th:nth-child(2){text-align:center}
th:nth-child(3),th:last-child{text-align:right}
tbody tr{border-bottom:1px solid #f3f4f6}
td{padding:16px 8px;font-size:12px}
td:first-child{text-align:left}td:nth-child(2){text-align:center}
td:nth-child(3),td:last-child{text-align:right}
.item-name{font-weight:700}.item-variant{font-size:10px;color:#999;margin-top:2px}
.totals{display:flex;justify-content:flex-end;margin-bottom:48px}
.totals-box{width:260px}
.total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:12px;color:#666}
.total-divider{height:1px;background:#e5e7eb;margin:8px 0}
.total-main{display:flex;justify-content:space-between;align-items:center;padding:16px;background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;margin-top:8px}
.total-label{font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#FE7501}
.total-amount{font-size:20px;font-weight:900;font-family:monospace}
.footer{border-top:2px dashed #e5e7eb;padding-top:32px;text-align:center}
.footer-badges{display:flex;justify-content:center;gap:32px;margin-bottom:16px}
.footer-badge{font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#aaa}
.footer-thanks{font-size:9px;color:#bbb;text-transform:uppercase;letter-spacing:4px}
@media print{body{padding:24px}}
</style></head><body>${printContent.innerHTML}</body></html>`);
        w.document.close();
        w.focus();
        setTimeout(() => { w.print(); }, 400);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-md py-8 px-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white text-black rounded-3xl max-w-[780px] w-full shadow-2xl overflow-hidden relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Toolbar */}
                        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-white/90 backdrop-blur-xl border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} border`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {statusCfg.label}
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono">{invoiceNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                                >
                                    <Printer className="w-3 h-3" /> Imprimer
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                                >
                                    <Download className="w-3 h-3" /> PDF
                                </button>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors ml-2">
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* ─── Printable Invoice Content ─── */}
                        <div id={`invoice-print-${order.id}`} className="px-10 py-10 sm:px-12">
                            {/* Header */}
                            <div className="header flex justify-between items-start mb-10 pb-6 border-b-2 border-black">
                                <div>
                                    <div className="store-name text-2xl font-black uppercase tracking-wider">{storeName}</div>
                                    <div className="store-sub text-[9px] text-gray-400 uppercase tracking-[0.25em] mt-1 font-bold">Facture officielle</div>
                                </div>
                                <div className="text-right">
                                    <div className="inv-label text-[9px] text-gray-400 uppercase tracking-[0.25em] font-bold">Facture N&deg;</div>
                                    <div className="inv-number text-lg font-mono font-black mt-1">{invoiceNumber}</div>
                                    <div className="inv-date text-[11px] text-gray-500 mt-1 capitalize">{date}</div>
                                    <div className="text-[10px] text-gray-400">{time}</div>
                                </div>
                            </div>

                            {/* AI Message */}
                            <div className="ai-box flex items-start gap-3 p-5 bg-gray-50 border border-gray-100 rounded-2xl mb-10">
                                <div className="ai-icon">
                                    <Sparkles className="w-4 h-4 text-[#FE7501] mt-0.5 shrink-0" />
                                </div>
                                <div className="ai-msg text-[11px] leading-relaxed text-gray-500">{aiMessage}</div>
                            </div>

                            {/* Client + Payment */}
                            <div className="grid-2 grid grid-cols-2 gap-12 mb-10">
                                <div>
                                    <div className="section-label text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Facture a</div>
                                    <div className="client-name text-base font-bold mb-1">{order.customer_name}</div>
                                    {order.customer_email && (
                                        <div className="client-detail text-[11px] text-gray-500 flex items-center gap-1.5 mb-0.5">
                                            <Mail className="w-3 h-3 text-gray-300" />{order.customer_email}
                                        </div>
                                    )}
                                    {order.customer_phone && (
                                        <div className="client-detail text-[11px] text-gray-500 flex items-center gap-1.5 mb-0.5">
                                            <Phone className="w-3 h-3 text-gray-300" />{order.customer_phone}
                                        </div>
                                    )}
                                    {shippingAddr && (
                                        <div className="client-detail text-[11px] text-gray-500 flex items-center gap-1.5">
                                            <MapPin className="w-3 h-3 text-gray-300" />{shippingAddr}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="section-label text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Paiement</div>
                                    <div className="pay-label flex items-center gap-2 justify-end mb-1">
                                        <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-sm font-bold capitalize">{paymentLabel}</span>
                                    </div>
                                    <div className="pay-status text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                                        {order.status === "cancelled" ? "Annule" : "Paye integralement"}
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <table className="w-full border-collapse mb-10">
                                <thead>
                                    <tr className="border-b-2 border-black">
                                        <th className="py-3 text-left text-[9px] font-black uppercase tracking-[0.15em] text-gray-500">Designation</th>
                                        <th className="py-3 text-center text-[9px] font-black uppercase tracking-[0.15em] text-gray-500">Qte</th>
                                        <th className="py-3 text-right text-[9px] font-black uppercase tracking-[0.15em] text-gray-500">Prix unit.</th>
                                        <th className="py-3 text-right text-[9px] font-black uppercase tracking-[0.15em] text-gray-500">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length > 0 ? items.map((item: any, i: number) => {
                                        const price = Number(item.price) || 0;
                                        const qty = Number(item.quantity) || 1;
                                        return (
                                            <tr key={i} className="border-b border-gray-100">
                                                <td className="py-5">
                                                    <div className="item-name font-bold text-sm">{item.name || "Article"}</div>
                                                    <div className="item-variant text-[10px] text-gray-400 mt-0.5">{item.variant || "Standard"}</div>
                                                </td>
                                                <td className="py-5 text-center text-sm font-medium">{qty}</td>
                                                <td className="py-5 text-right text-sm font-medium font-mono">{formatPrice(price, "XOF")}</td>
                                                <td className="py-5 text-right text-sm font-bold font-mono">{formatPrice(price * qty, "XOF")}</td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr className="border-b border-gray-100">
                                            <td className="py-5"><div className="font-bold">Commande</div></td>
                                            <td className="py-5 text-center">1</td>
                                            <td className="py-5 text-right font-mono">{formatPrice(total, "XOF")}</td>
                                            <td className="py-5 text-right font-bold font-mono">{formatPrice(total, "XOF")}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Totals */}
                            <div className="totals flex justify-end mb-12">
                                <div className="totals-box w-64 space-y-2">
                                    <div className="total-row flex justify-between text-sm">
                                        <span className="text-gray-400">Sous-total</span>
                                        <span className="font-mono">{formatPrice(subtotal, "XOF")}</span>
                                    </div>
                                    <div className="total-row flex justify-between text-sm">
                                        <span className="text-gray-400">Livraison</span>
                                        <span className="font-mono">Gratuit</span>
                                    </div>
                                    <div className="total-row flex justify-between text-sm">
                                        <span className="text-gray-400">TVA</span>
                                        <span className="font-mono">0%</span>
                                    </div>
                                    <div className="total-divider h-px bg-gray-200 my-2" />
                                    <div className="total-main flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <span className="total-label text-[10px] font-black uppercase tracking-widest" style={{ color: "#FE7501" }}>Total TTC</span>
                                        <span className="total-amount text-xl font-black font-mono">{formatPrice(total, "XOF")}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="footer border-t-2 border-dashed border-gray-200 pt-8">
                                <div className="footer-badges flex justify-center gap-10 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-gray-300" />
                                        <span className="footer-badge text-[8px] font-black uppercase tracking-widest text-gray-400">Expedition securisee</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-gray-300" />
                                        <span className="footer-badge text-[8px] font-black uppercase tracking-widest text-gray-400">Authenticite garantie</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-gray-300" />
                                        <span className="footer-badge text-[8px] font-black uppercase tracking-widest text-gray-400">Aura Experience</span>
                                    </div>
                                </div>
                                <div className="footer-thanks text-[9px] text-gray-300 text-center uppercase tracking-[0.4em]">
                                    Merci pour votre confiance &mdash; {storeName} &mdash; Document genere automatiquement
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
