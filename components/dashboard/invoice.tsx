"use client";

import { formatPrice } from "@/lib/currency-engine";
import { siteConfig } from "@/lib/config";
import { Package, ShieldCheck, Zap } from "lucide-react";

interface InvoiceProps {
    order: any;
    storeName: string;
}

export function Invoice({ order, storeName }: InvoiceProps) {
    const primaryColor = siteConfig.branding.colors.primary;

    return (
        <div id={`invoice-${order.id}`} className="bg-white text-black p-12 max-w-[800px] mx-auto hidden print:block">
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2" style={{ color: primaryColor }}>FACTURE</h1>
                    <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">N° {order.id.toUpperCase()}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-black uppercase tracking-tight">{storeName}</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Aura Store Experience</p>
                </div>
            </div>

            {/* Client & Date */}
            <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Facturé à :</p>
                    <p className="font-bold text-lg">{order.customer_name}</p>
                    <p className="text-sm text-gray-600">{order.customer_email}</p>
                    {order.customer_phone && <p className="text-sm text-gray-600">{order.customer_phone}</p>}
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Date d'émission :</p>
                    <p className="font-bold">{new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>

            {/* Items Table */}
            <div className="w-full mb-12">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest">Désignation</th>
                            <th className="py-4 text-center text-[10px] font-black uppercase tracking-widest">Qté</th>
                            <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest">Prix Unit.</th>
                            <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(order.items) ? order.items.map((item: any, i: number) => (
                            <tr key={i} className="border-b border-gray-100">
                                <td className="py-6">
                                    <p className="font-bold">{item.name}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{item.variant || 'Standard Edition'}</p>
                                </td>
                                <td className="py-6 text-center font-medium">{item.quantity || 1}</td>
                                <td className="py-6 text-right font-medium">{formatPrice(item.price, "XOF")}</td>
                                <td className="py-6 text-right font-bold">{formatPrice(item.price * (item.quantity || 1), "XOF")}</td>
                            </tr>
                        )) : (
                            <tr className="border-b border-gray-100">
                                <td className="py-6">
                                    <p className="font-bold">Commande Globalisée</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Récapitulatif des articles</p>
                                </td>
                                <td className="py-6 text-center font-medium">1</td>
                                <td className="py-6 text-right font-medium">{formatPrice(order.total, "XOF")}</td>
                                <td className="py-6 text-right font-bold">{formatPrice(order.total, "XOF")}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end mb-16">
                <div className="w-64 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400 uppercase tracking-widest">Sous-total</span>
                        <span className="font-bold">{formatPrice(order.total, "XOF")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400 uppercase tracking-widest">Livraison</span>
                        <span className="font-bold">GRATUIT</span>
                    </div>
                    <div className="h-px bg-gray-200" />
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-black uppercase tracking-widest" style={{ color: primaryColor }}>TOTAL</span>
                        <span className="text-2xl font-black">{formatPrice(order.total, "XOF")}</span>
                    </div>
                </div>
            </div>

            {/* Footer / AI Note */}
            <div className="border-t-2 border-dashed border-gray-100 pt-12">
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300"><Package size={16} /></div>
                        <span className="text-[8px] font-black uppercase tracking-widest leading-tight">Expédition<br />Sécurisée</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300"><ShieldCheck size={16} /></div>
                        <span className="text-[8px] font-black uppercase tracking-widest leading-tight">Authenticité<br />Garantie</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300"><Zap size={16} /></div>
                        <span className="text-[8px] font-black uppercase tracking-widest leading-tight">Aura Next<br />Expérience</span>
                    </div>
                </div>
                <p className="text-[10px] text-gray-400 text-center uppercase tracking-[0.3em]">Merci d'avoir choisi l'Excellence avec {storeName}</p>
            </div>
        </div>
    );
}
