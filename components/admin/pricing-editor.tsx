"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap, Target, Crown, Star, Shield,
    Plus, Edit, Trash2, Save, X, Loader2,
    CheckCircle2, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Plan Type derived from Database Schema
interface Plan {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    is_custom_price: boolean;
    icon_name: string;
    accent_color: string;
    is_popular: boolean;
    features_list: string[];

    // Technical Quotas (-1 = Unlimited)
    max_stores: number;
    max_products_per_store: number;
    max_photos_sync: number;
    max_ai_generations: number;
    max_vto_requests: number;

    // Feature Flags (Booleans)
    has_analytics: boolean;
    has_seo_ai: boolean;
    has_marketing_hub: boolean;
    has_vto_3d: boolean;
    has_api_access: boolean;
    has_custom_domain: boolean;
    has_multi_admin: boolean;
    has_remove_branding: boolean;
    has_priority_support: boolean;
    has_custom_themes: boolean;

    // Financials
    commission_rate: number;
    transaction_fee: number;

    display_order: number;
}

const ICON_MAP: Record<string, any> = { Zap, Target, Crown, Star, Shield };

export function PricingEditor() {
    const router = useRouter();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Plan>>({});

    // Fetch Plans
    useEffect(() => {
        fetch("/api/plans")
            .then(res => res.json())
            .then(data => {
                setPlans(data.plans || []);
                setLoading(false);
            });
    }, []);

    // Save (Create or Update)
    const handleSave = async () => {
        try {
            const method = editingId === "new" ? "POST" : "PUT";
            const body = editingId === "new" ? formData : { ...formData, id: editingId };

            const res = await fetch("/api/plans", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Erreur inconnue lors de la sauvegarde");
            }

            const { plan } = await res.json();

            if (editingId === "new") {
                setPlans([...plans, plan]);
            } else {
                setPlans(plans.map(p => p.id === plan.id ? plan : p));
            }

            setEditingId(null);
            setFormData({});
            toast.success("Plan sauvegardé !");
            router.refresh(); // Refresh server components if any
        } catch (err: any) {
            console.error(err);
            toast.error(`Erreur: ${err.message}`);
        }
    };

    // Delete
    const handleDelete = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce plan ?")) return;
        try {
            await fetch(`/api/plans?id=${id}`, { method: "DELETE" });
            setPlans(plans.filter(p => p.id !== id));
            toast.success("Plan supprimé");
        } catch (err) {
            toast.error("Erreur de suppression");
        }
    };

    const startEdit = (plan: Plan) => {
        setEditingId(plan.id);
        setFormData(plan);
    };

    const startNew = () => {
        setEditingId("new");
        setFormData({
            name: "Nouveau Plan",
            slug: `plan-${Date.now()}`,
            description: "Description du plan",
            price: 0,
            is_custom_price: false,
            icon_name: "Zap",
            accent_color: "white",
            is_popular: false,
            features_list: ["Nouvelle fonctionnalité"],

            // Quotas
            max_stores: 1,
            max_products_per_store: 25,
            max_photos_sync: 10,
            max_ai_generations: 5,
            max_vto_requests: 0,

            // Features
            has_analytics: false,
            has_seo_ai: false,
            has_marketing_hub: false,
            has_vto_3d: false,
            has_api_access: false,
            has_custom_domain: false,
            has_multi_admin: false,
            has_remove_branding: false,
            has_priority_support: false,
            has_custom_themes: false,

            // Financials
            commission_rate: 2.0,
            transaction_fee: 0,

            display_order: plans.length + 1
        });
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white uppercase italic">Gestion des Tarifs</h2>
                <button onClick={startNew} className="flex items-center gap-2 px-6 py-2 bg-primary text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4" /> Ajouter Un Plan
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* List / Preview */}
                <div className="space-y-6">
                    {plans.map((plan) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-6 bg-[#121216]/60 border rounded-2xl transition-all ${editingId === plan.id ? 'border-primary ring-1 ring-primary/50' : 'border-white/5 hover:border-white/10'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${plan.is_popular ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/60'}`}>
                                        {(() => {
                                            const Icon = ICON_MAP[plan.icon_name] || Zap;
                                            return <Icon className="w-5 h-5" />;
                                        })()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider">{plan.description}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => startEdit(plan)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(plan.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-500/60 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-end border-t border-white/5 pt-4">
                                <div className="text-2xl font-black text-white">
                                    {plan.is_custom_price ? "Sur Devis" : `${plan.price.toLocaleString()} FCFA`}
                                    {!plan.is_custom_price && <span className="text-xs text-white/30 font-medium ml-1">/mois</span>}
                                </div>
                                <div className="flex flex-wrap gap-2 justify-end">
                                    {plan.has_vto_3d && <Badge label="VTO 3D" color="purple" />}
                                    {plan.has_api_access && <Badge label="API" color="blue" />}
                                    <Badge label={`${plan.max_stores === -1 ? '∞' : plan.max_stores} Stores`} color="green" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Editor Form */}
                <div className="bg-[#0A0A0C] border border-white/10 rounded-2xl p-8 sticky top-8 h-fit">
                    {editingId ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-white uppercase tracking-widest">
                                    {editingId === "new" ? "Nouveau Plan" : "Modification"}
                                </h3>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingId(null)} className="p-2 hover:bg-white/10 rounded-lg text-white/60"><X className="w-5 h-5" /></button>
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Nom" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
                                <Input label="Slug (Unique)" value={formData.slug} onChange={v => setFormData({ ...formData, slug: v })} />
                            </div>
                            <Input label="Description" value={formData.description} onChange={v => setFormData({ ...formData, description: v })} />

                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Prix (FCFA)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white font-mono focus:border-primary/50 outline-none"
                                        disabled={formData.is_custom_price}
                                    />
                                </div>
                                <div className="flex items-center gap-3 pt-6">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_custom_price}
                                        onChange={e => setFormData({ ...formData, is_custom_price: e.target.checked })}
                                        className="w-4 h-4 rounded border-white/20 bg-black/40 text-primary focus:ring-primary"
                                    />
                                    <span className="text-xs font-bold text-white/60 uppercase">Sur Devis</span>
                                </div>
                            </div>

                            {/* Quotas & Limits */}
                            {/* Financials Section */}
                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-4">
                                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Commissions & Frais</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Commission (%)</label>
                                        <input
                                            type="number" step="0.1"
                                            value={formData.commission_rate}
                                            onChange={e => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-sm font-mono focus:border-emerald-500/50 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Frais Fixe (FCFA)</label>
                                        <input
                                            type="number"
                                            value={formData.transaction_fee}
                                            onChange={e => setFormData({ ...formData, transaction_fee: parseInt(e.target.value) })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-sm font-mono focus:border-emerald-500/50 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Quotas & Limits */}
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-4">
                                <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-2">Quotas & Limites (-1 = Illimité)</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <Input label="Boutiques" type="number" value={formData.max_stores} onChange={v => setFormData({ ...formData, max_stores: parseInt(v) })} />
                                    <Input label="Produits / Store" type="number" value={formData.max_products_per_store} onChange={v => setFormData({ ...formData, max_products_per_store: parseInt(v) })} />
                                    <Input label="Aura Sync (Photos)" type="number" value={formData.max_photos_sync} onChange={v => setFormData({ ...formData, max_photos_sync: parseInt(v) })} />
                                    <Input label="AI Générations" type="number" value={formData.max_ai_generations} onChange={v => setFormData({ ...formData, max_ai_generations: parseInt(v) })} />
                                    <Input label="VTO Séances" type="number" value={formData.max_vto_requests} onChange={v => setFormData({ ...formData, max_vto_requests: parseInt(v) })} />
                                </div>
                            </div>

                            {/* Features Toggles */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-white/60 uppercase tracking-widest">Fonctionnalités Clés</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <Toggle label="Analytics Pro" checked={formData.has_analytics} onChange={c => setFormData({ ...formData, has_analytics: c })} />
                                    <Toggle label="Marketing Hub" checked={formData.has_marketing_hub} onChange={c => setFormData({ ...formData, has_marketing_hub: c })} />
                                    <Toggle label="SEO AI Auto" checked={formData.has_seo_ai} onChange={c => setFormData({ ...formData, has_seo_ai: c })} />
                                    <Toggle label="VTO 3D Module" checked={formData.has_vto_3d} onChange={c => setFormData({ ...formData, has_vto_3d: c })} />
                                    <Toggle label="Thèmes Premium" checked={formData.has_custom_themes} onChange={c => setFormData({ ...formData, has_custom_themes: c })} />
                                    <Toggle label="API Access" checked={formData.has_api_access} onChange={c => setFormData({ ...formData, has_api_access: c })} />
                                    <Toggle label="Nom de Domaine" checked={formData.has_custom_domain} onChange={c => setFormData({ ...formData, has_custom_domain: c })} />
                                    <Toggle label="Multi-Collaborateur" checked={formData.has_multi_admin} onChange={c => setFormData({ ...formData, has_multi_admin: c })} />
                                    <Toggle label="No Branding" checked={formData.has_remove_branding} onChange={c => setFormData({ ...formData, has_remove_branding: c })} />
                                    <Toggle label="Support Prioritaire" checked={formData.has_priority_support} onChange={c => setFormData({ ...formData, has_priority_support: c })} />
                                </div>
                            </div>

                            {/* Features List (Display) */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Liste Affichée (séparez par virgule)</label>
                                <textarea
                                    value={formData.features_list?.join(", ")}
                                    onChange={e => setFormData({ ...formData, features_list: e.target.value.split(",").map(s => s.trim()) })}
                                    className="w-full h-24 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-medium focus:border-primary/50 outline-none"
                                />
                            </div>

                            <button onClick={handleSave} className="w-full py-3 bg-primary text-black font-black uppercase rounded-xl hover:opacity-90 transition-opacity">
                                Sauvegarder les modifications
                            </button>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-4 min-h-[400px]">
                            <Edit className="w-12 h-12 opacity-20" />
                            <p className="text-xs uppercase tracking-widest font-bold">Sélectionnez un plan pour l'éditer</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// UI Helpers
const Badge = ({ label, color }: { label: string, color: string }) => (
    <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider bg-${color}-500/10 text-${color}-500 border border-${color}-500/20`}>
        {label}
    </span>
);

const Input = ({ label, value, onChange, type = "text" }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</label>
        <input
            type={type}
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-primary/50 outline-none"
        />
    </div>
);

const Toggle = ({ label, checked, onChange }: any) => (
    <div onClick={() => onChange(!checked)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${checked ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/5'}`}>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${checked ? 'text-primary' : 'text-white/40'}`}>{label}</span>
        <div className={`w-3 h-3 rounded-full border ${checked ? 'bg-primary border-primary' : 'bg-transparent border-white/20'}`} />
    </div>
);
