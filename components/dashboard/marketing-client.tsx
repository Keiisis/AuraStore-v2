"use client";

import React, { useState } from "react";
import {
    Magnet,
    MessageSquare,
    MoreHorizontal,
    Search,
    Zap,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    Sparkles,
    Trash2,
    Eye,
    BarChart3,
    Smartphone,
    User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface MarketingClientProps {
    storeId: string;
    initialLeads: any[];
    whatsappNumber: string;
}

export function MarketingClient({ storeId, initialLeads, whatsappNumber }: MarketingClientProps) {
    const [leads, setLeads] = useState(initialLeads);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLead, setSelectedLead] = useState<any>(null);

    const filteredLeads = leads?.filter(lead =>
        lead.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.customer_whatsapp?.includes(searchQuery)
    ) || [];

    const handleRelaunch = (lead: any) => {
        const productName = lead.products?.name || "un de nos articles";
        const text = `Bonjour ${lead.customer_name} ! ✨ C'est l'équipe d'Aura. On a vu que vous avez essayé l'article *${productName}* via notre lab IA. L'essayage était magnifique ! Avez-vous besoin d'aide pour finaliser votre commande ? Nous avons actuellement une offre spéciale pour vous. 😉`;
        const url = `https://wa.me/${lead.customer_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
        toast.success(`Relance WhatsApp préparée pour ${lead.customer_name}`);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Elegant Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/[0.01] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="space-y-1 relative z-10">
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <Magnet className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Propulsion Commerciale</span>
                    </div>
                    <h1 className="text-4xl font-display font-black text-white italic tracking-tight">Marketing & Conversion</h1>
                    <p className="text-white/40 font-medium text-sm">Transformez vos essayages virtuels en ventes concrètes par relance directe.</p>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="glass-card px-5 py-3 rounded-2xl border border-white/10 flex flex-col items-center">
                        <span className="text-primary font-display font-black text-xl leading-none">{leads.length}</span>
                        <span className="text-[8px] font-black text-white/40 uppercase mt-1 tracking-widest">Leads VTO</span>
                    </div>
                    <div className="glass-card px-5 py-3 rounded-2xl border border-white/10 flex flex-col items-center">
                        <span className="text-emerald-500 font-display font-black text-xl leading-none">{leads.filter(l => l.status === 'converted').length}</span>
                        <span className="text-[8px] font-black text-white/40 uppercase mt-1 tracking-widest">Conversions</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Leads Table Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Rechercher un client ou numéro..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/10"
                            />
                        </div>
                    </div>

                    <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.01]">
                                        <th className="px-6 py-5 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Client / Contact</th>
                                        <th className="px-6 py-5 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Produit Essayé</th>
                                        <th className="px-6 py-5 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Date / Heure</th>
                                        <th className="px-6 py-5 text-[9px] font-black text-white/30 uppercase tracking-[0.2em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredLeads.map((lead) => (
                                        <tr
                                            key={lead.id}
                                            className={`hover:bg-white/[0.02] transition-colors cursor-pointer group ${selectedLead?.id === lead.id ? 'bg-primary/5' : ''}`}
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:border-primary/20 group-hover:text-primary transition-all">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-white uppercase tracking-tight">{lead.customer_name}</p>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <Smartphone className="w-2.5 h-2.5 text-white/20" />
                                                            <p className="text-[10px] text-white/40 font-bold">{lead.customer_whatsapp}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-black shadow-inner">
                                                        <img src={lead.products?.images?.[0] || ""} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-white/60 group-hover:text-white transition-colors">{lead.products?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-white/40">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold">{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: fr })}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRelaunch(lead); }}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    <MessageSquare className="w-3 h-3 fill-current" /> Relancer
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* AI & Detail Panel */}
                <div className="space-y-6">
                    <div className="glass-card rounded-[2.5rem] border border-white/5 p-8 relative overflow-hidden bg-black/40">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                        <div className="flex items-center gap-3 text-primary mb-6">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            <h3 className="font-display font-black text-xs uppercase tracking-[0.2em] text-white">Focus Marketing IA</h3>
                        </div>

                        {selectedLead ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Résultat de l'essayage</p>
                                    <div className="aspect-[3/4] rounded-[2rem] overflow-hidden border border-white/10 relative group bg-black/60 shadow-2xl">
                                        {selectedLead.result_photo_url ? (
                                            <img src={selectedLead.result_photo_url} className="w-full h-full object-cover" alt="Final VTO" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-white/10 gap-4">
                                                <Zap className="w-12 h-12" />
                                                <p className="text-[10px] font-black uppercase italic tracking-widest">Fusion non générée</p>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                                            <div className="flex gap-2">
                                                <button className="flex-1 py-3 bg-white text-black rounded-xl text-[8px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                                    <Eye className="w-3 h-3" /> Zoom
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">Stratégie IA de Relance</p>
                                        <div className="px-2 py-0.5 bg-primary/20 rounded-md">
                                            <span className="text-[7px] font-black text-primary uppercase">Optimisé</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl italic leading-relaxed text-white/70 text-[11px] font-medium border-l-2 border-l-primary shadow-lg">
                                        "L'algorithme suggère une relance immédiate avec un code promo de 10% car le client a passé plus de 45 secondes sur l'essayage 3D de cet article."
                                    </div>
                                    <button
                                        onClick={() => handleRelaunch(selectedLead)}
                                        className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        Appliquer & Relancer
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                                <Magnet className="w-16 h-16 text-white" />
                                <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Sélectionnez un lead pour<br />analyser sa stratégie Aura IA</p>
                            </div>
                        )}
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <BarChart3 className="w-4 h-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Insights Aura™</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[11px] text-white/60 leading-relaxed font-bold tracking-tight">
                                Vos clients sont <span className="text-primary">85% plus susceptibles</span> de convertir après un essai VTO IA. Continuez à les relancer !
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
