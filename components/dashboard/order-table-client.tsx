"use client";

import { useState } from "react";
import { MoreHorizontal, FileText, Printer, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/currency-engine";
import { updateOrderStatus } from "@/lib/actions/order";
import { askAuraAssistant } from "@/lib/actions/ai";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Invoice } from "./invoice";

interface OrderTableClientProps {
    orders: any[];
    storeSlug: string;
    storeName: string;
}

export function OrderTableClient({ orders: initialOrders, storeSlug, storeName }: OrderTableClientProps) {
    const [orders, setOrders] = useState(initialOrders);
    const [updating, setUpdating] = useState<string | null>(null);
    const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any>(null);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdating(orderId);
        const result = await updateOrderStatus(orderId, newStatus as any, storeSlug);

        if (result.success) {
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            toast.success(`Statut mis à jour : ${newStatus.toUpperCase()}`);
        } else {
            toast.error("Erreur lors de la mise à jour");
        }
        setUpdating(null);
    };

    const handleGenerateInvoice = (order: any) => {
        toast.info("Génération de la facture extraordinaire...", {
            icon: <Printer className="w-4 h-4 text-primary" />,
        });

        // Simulating automated download for now
        // In a real scenario, this would trigger a PDF generation client-side or server-side
        setTimeout(() => {
            window.print(); // Temporary for demo of 'professional action'
        }, 1500);
    };

    const handleAiRelance = async (order: any) => {
        toast.promise(askAuraAssistant(`Génère un message WhatsApp court, ultra-professionnel (style Gentleman) et persuasif (PNL) pour relancer ce client qui n'a pas encore payé sa commande de ${order.total} FCFA. Il s'appelle ${order.customer_name}.`, JSON.stringify(order)), {
            loading: 'L\'Assistant Aura réfléchit à la meilleure approche...',
            success: (data: any) => {
                if (data.success) {
                    const msg = encodeURIComponent(data.answer);
                    window.open(`https://wa.me/${order.customer_phone || ''}?text=${msg}`, '_blank');
                    return 'Message de relance généré par l\'IA ! 🎩';
                }
                return 'Succès partiel';
            },
            error: 'Erreur de connexion avec l\'IA',
        });
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-6 py-4 text-left text-[10px] font-black tracking-widest text-white/30 uppercase">ID</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black tracking-widest text-white/30 uppercase">Client</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black tracking-widest text-white/30 uppercase">Date</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black tracking-widest text-white/30 uppercase">Statut</th>
                        <th className="px-6 py-4 text-right text-[10px] font-black tracking-widest text-white/30 uppercase">Total</th>
                        <th className="px-6 py-4 text-right text-[10px] font-black tracking-widest text-white/30 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-6 py-4">
                                <span className="font-mono text-xs text-white/40">#{order.id.slice(0, 8)}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase">
                                        {order.customer_name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{order.customer_name}</p>
                                        <p className="text-[10px] text-white/40 font-mono">{order.customer_email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-xs text-white/60 font-medium">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                        disabled={updating === order.id}
                                        className={`bg-transparent border-none text-[10px] font-black uppercase tracking-wider focus:ring-0 cursor-pointer ${order.status === 'delivered' ? "text-emerald-500" :
                                            order.status === 'cancelled' ? "text-red-500" :
                                                "text-yellow-500"
                                            }`}
                                    >
                                        <option value="pending" className="bg-[#111]">En Attente</option>
                                        <option value="confirmed" className="bg-[#111]">Confirmé</option>
                                        <option value="shipped" className="bg-[#111]">Expédié</option>
                                        <option value="delivered" className="bg-[#111]">Livré</option>
                                        <option value="cancelled" className="bg-[#111]">Avorté</option>
                                    </select>
                                    {updating === order.id && <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className="text-sm font-bold text-white font-mono">
                                    {formatPrice(order.total, "XOF")}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => handleAiRelance(order)}
                                            className="p-2 rounded-lg hover:bg-primary/10 text-primary/40 hover:text-primary transition-colors"
                                            title="IA Relance PNL"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                        </button>
                                    )}
                                    {order.status === 'delivered' && (
                                        <motion.button
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            onClick={() => handleGenerateInvoice(order)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-primary hover:text-white transition-all"
                                        >
                                            <FileText className="w-3 h-3" />
                                            Facture
                                        </motion.button>
                                    )}
                                    <button className="p-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Hidden Invoices for printing */}
            <div className="hidden">
                {orders.map(order => (
                    <Invoice key={`inv-${order.id}`} order={order} storeName={storeName} />
                ))}
            </div>
        </div>
    );
}
