"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Trash2, Edit3, Save, X, Zap, Target, Crown,
    Check, GripVertical, Eye, EyeOff, Loader2, Star,
    Shield, BarChart3, Globe, Users, Cpu, MessageSquare
} from "lucide-react";
import { createPlan, updatePlan, deletePlan, type PlanInput } from "@/lib/actions/plans";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ICON_MAP: Record<string, any> = { Zap, Target, Crown, Star, Shield };
const ACCENT_OPTIONS = ["white", "primary", "accent", "emerald", "blue", "purple"];

interface PlansManagerProps {
    plans: any[];
}

const EMPTY_PLAN: PlanInput = {
    name: "", slug: "", description: "", price: 0, currency: "XOF",
    billing_cycle: "monthly", is_custom_price: false,
    max_stores: 1, max_products_per_store: 50, max_photos_sync: 10,
    has_analytics: false, has_seo_ai: false, has_viral_hub: false,
    has_vto_3d: false, has_api_access: false, has_custom_domain: false,
    has_multi_admin: false, has_dedicated_manager: false,
    support_level: "email", icon_name: "Zap", accent_color: "white",
    is_popular: false, display_order: 0, is_active: true, features_list: [],
};

export function PlansManager({ plans }: PlansManagerProps) {
    const router = useRouter();
    const [editingPlan, setEditingPlan] = useState<any | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [newFeature, setNewFeature] = useState("");

    const [form, setForm] = useState<PlanInput>(EMPTY_PLAN);

    const openCreate = () => {
        setForm(EMPTY_PLAN);
        setIsCreating(true);
        setEditingPlan(null);
    };

    const openEdit = (plan: any) => {
        setForm({
            ...plan,
            features_list: plan.features_list || [],
        });
        setEditingPlan(plan);
        setIsCreating(false);
    };

    const closeEditor = () => {
        setEditingPlan(null);
        setIsCreating(false);
        setForm(EMPTY_PLAN);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (isCreating) {
                const res = await createPlan(form);
                if (res.error) throw new Error(res.error);
                toast.success(`Plan "${form.name}" créé avec succès`);
            } else if (editingPlan) {
                const res = await updatePlan(editingPlan.id, form);
                if (res.error) throw new Error(res.error);
                toast.success(`Plan "${form.name}" mis à jour`);
            }
            closeEditor();
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (planId: string) => {
        setDeletingId(planId);
        try {
            const res = await deletePlan(planId);
            if (res.error) throw new Error(res.error);
            toast.success("Plan supprimé");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setForm(prev => ({ ...prev, features_list: [...prev.features_list, newFeature.trim()] }));
            setNewFeature("");
        }
    };

    const removeFeature = (idx: number) => {
        setForm(prev => ({ ...prev, features_list: prev.features_list.filter((_, i) => i !== idx) }));
    };

    const isEditorOpen = isCreating || editingPlan;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                        <Crown className="w-8 h-8 text-primary" />
                        Tarification SaaS
                    </h2>
                    <p className="text-[11px] text-white/30 font-bold uppercase tracking-[0.2em]">Gestion dynamique des plans & feature-gating</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                    <Plus className="w-4 h-4" /> Nouveau Plan
                </button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan: any) => {
                    const IconComp = ICON_MAP[plan.icon_name] || Zap;
                    return (
                        <motion.div
                            key={plan.id}
                            layout
                            className={`volcanic-glass p-8 space-y-6 group relative overflow-hidden ${plan.is_popular ? 'border-primary/20 ring-1 ring-primary/10' : ''} ${!plan.is_active ? 'opacity-50' : ''}`}
                        >
                            {plan.is_popular && (
                                <div className="absolute top-6 right-6 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-[8px] font-black text-primary uppercase tracking-widest">
                                    Populaire
                                </div>
                            )}

                            {!plan.is_active && (
                                <div className="absolute top-6 right-6 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-[8px] font-black text-red-400 uppercase tracking-widest">
                                    Inactif
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                                    <IconComp className="w-6 h-6 text-white/60" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">{plan.description}</p>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-1">
                                {plan.is_custom_price ? (
                                    <span className="text-3xl font-black text-white">Sur devis</span>
                                ) : (
                                    <>
                                        <span className="text-3xl font-black text-white">{plan.price.toLocaleString()}</span>
                                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">FCFA/mois</span>
                                    </>
                                )}
                            </div>

                            {/* Feature Limits Summary */}
                            <div className="grid grid-cols-2 gap-2 py-4 border-y border-white/5">
                                <div className="text-[9px] text-white/40 font-bold uppercase">
                                    <span className="text-white font-black">{plan.max_stores === -1 ? '∞' : plan.max_stores}</span> boutiques
                                </div>
                                <div className="text-[9px] text-white/40 font-bold uppercase">
                                    <span className="text-white font-black">{plan.max_products_per_store === -1 ? '∞' : plan.max_products_per_store}</span> produits
                                </div>
                                <div className="text-[9px] text-white/40 font-bold uppercase">
                                    <span className="text-white font-black">{plan.max_photos_sync === -1 ? '∞' : plan.max_photos_sync}</span> photos IA
                                </div>
                                <div className="text-[9px] text-white/40 font-bold uppercase">
                                    Support <span className="text-white font-black">{plan.support_level}</span>
                                </div>
                            </div>

                            {/* Features Display */}
                            <div className="space-y-2">
                                {(plan.features_list || []).map((f: string) => (
                                    <div key={f} className="flex items-center gap-2">
                                        <Check className="w-3 h-3 text-primary" />
                                        <span className="text-[10px] text-white/50 font-medium">{f}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-4 border-t border-white/5">
                                <button
                                    onClick={() => openEdit(plan)}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[9px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <Edit3 className="w-3 h-3" /> Modifier
                                </button>
                                <button
                                    onClick={() => handleDelete(plan.id)}
                                    disabled={deletingId === plan.id}
                                    className="py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all disabled:opacity-50"
                                >
                                    {deletingId === plan.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Editor Modal */}
            <AnimatePresence>
                {isEditorOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-start justify-center p-4 overflow-y-auto"
                        onClick={(e) => e.target === e.currentTarget && closeEditor()}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.95 }}
                            className="w-full max-w-3xl volcanic-glass p-8 my-12 space-y-8"
                        >
                            {/* Modal Header */}
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-black text-white uppercase italic">
                                    {isCreating ? "Nouveau Plan" : `Modifier: ${editingPlan?.name}`}
                                </h3>
                                <button onClick={closeEditor} className="p-2 hover:bg-white/5 rounded-lg text-white/30 hover:text-white transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Nom du Plan</label>
                                    <input
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                                        placeholder="Ex: Pro"
                                    />
                                </div>

                                {/* Slug */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Slug (URL)</label>
                                    <input
                                        value={form.slug}
                                        onChange={e => setForm(f => ({ ...f, slug: (e.target.value || "").toLowerCase().replace(/\s/g, '-') }))}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                                        placeholder="ex: pro"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Description</label>
                                    <input
                                        value={form.description}
                                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                                        placeholder="L'outil des boutiques d'élite"
                                    />
                                </div>

                                {/* Price */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Prix (FCFA)</label>
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                                        disabled={form.is_custom_price}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-primary/50 transition-all disabled:opacity-30"
                                    />
                                </div>

                                {/* Custom Price Toggle */}
                                <div className="space-y-2 flex flex-col justify-end">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-10 h-6 rounded-full transition-all ${form.is_custom_price ? 'bg-primary' : 'bg-white/10'} p-0.5`}
                                            onClick={() => setForm(f => ({ ...f, is_custom_price: !f.is_custom_price }))}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${form.is_custom_price ? 'translate-x-4' : ''}`} />
                                        </div>
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Sur Devis</span>
                                    </label>
                                </div>
                            </div>

                            {/* Feature Limits */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Feature Gates & Limites</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-white/20 uppercase">Max Boutiques</label>
                                        <input type="number" value={form.max_stores}
                                            onChange={e => setForm(f => ({ ...f, max_stores: Number(e.target.value) }))}
                                            className="w-full px-3 py-2 bg-white/[0.03] border border-white/5 rounded-lg text-white text-xs font-bold focus:outline-none focus:border-primary/50"
                                        />
                                        <p className="text-[8px] text-white/20">-1 = illimité</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-white/20 uppercase">Max Produits</label>
                                        <input type="number" value={form.max_products_per_store}
                                            onChange={e => setForm(f => ({ ...f, max_products_per_store: Number(e.target.value) }))}
                                            className="w-full px-3 py-2 bg-white/[0.03] border border-white/5 rounded-lg text-white text-xs font-bold focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-white/20 uppercase">Photos IA</label>
                                        <input type="number" value={form.max_photos_sync}
                                            onChange={e => setForm(f => ({ ...f, max_photos_sync: Number(e.target.value) }))}
                                            className="w-full px-3 py-2 bg-white/[0.03] border border-white/5 rounded-lg text-white text-xs font-bold focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-white/20 uppercase">Ordre Affichage</label>
                                        <input type="number" value={form.display_order}
                                            onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))}
                                            className="w-full px-3 py-2 bg-white/[0.03] border border-white/5 rounded-lg text-white text-xs font-bold focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Boolean Features */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Fonctionnalités Premium</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {[
                                        { key: "has_analytics", label: "Analytics Premium", icon: BarChart3 },
                                        { key: "has_seo_ai", label: "SEO Opti IA", icon: Cpu },
                                        { key: "has_viral_hub", label: "Viral Content Hub", icon: MessageSquare },
                                        { key: "has_vto_3d", label: "Essayage 3D (VTO)", icon: Eye },
                                        { key: "has_api_access", label: "API Custom", icon: Globe },
                                        { key: "has_custom_domain", label: "Domaine Custom", icon: Globe },
                                        { key: "has_multi_admin", label: "Multi-comptes", icon: Users },
                                        { key: "has_dedicated_manager", label: "Manager Dédié", icon: Shield },
                                        { key: "is_popular", label: "Badge Populaire", icon: Star },
                                        { key: "is_active", label: "Plan Actif", icon: Eye },
                                    ].map(feat => (
                                        <button
                                            key={feat.key}
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, [feat.key]: !(f as any)[feat.key] }))}
                                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[9px] font-black uppercase tracking-wide transition-all ${(form as any)[feat.key]
                                                ? 'bg-primary/10 border-primary/30 text-primary'
                                                : 'bg-white/[0.02] border-white/5 text-white/30 hover:text-white/50'
                                                }`}
                                        >
                                            <feat.icon className="w-3.5 h-3.5" />
                                            {feat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Display Config */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Icône</label>
                                    <select value={form.icon_name}
                                        onChange={e => setForm(f => ({ ...f, icon_name: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-primary/50"
                                    >
                                        {Object.keys(ICON_MAP).map(icon => (
                                            <option key={icon} value={icon}>{icon}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Couleur Accent</label>
                                    <select value={form.accent_color}
                                        onChange={e => setForm(f => ({ ...f, accent_color: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-primary/50"
                                    >
                                        {ACCENT_OPTIONS.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Support</label>
                                    <select value={form.support_level}
                                        onChange={e => setForm(f => ({ ...f, support_level: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-primary/50"
                                    >
                                        <option value="email">Email</option>
                                        <option value="priority">Priority</option>
                                        <option value="dedicated">Dedicated</option>
                                    </select>
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Liste Affichée (Landing Page)</h4>
                                <div className="space-y-2">
                                    {form.features_list.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 group/item">
                                            <GripVertical className="w-3 h-3 text-white/10" />
                                            <div className="flex-1 px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg text-[10px] text-white font-medium">{f}</div>
                                            <button onClick={() => removeFeature(i)} className="p-1 text-red-400/40 hover:text-red-400 transition-colors">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        value={newFeature}
                                        onChange={e => setNewFeature(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                        placeholder="Ajouter une feature visible..."
                                        className="flex-1 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-primary/50"
                                    />
                                    <button onClick={addFeature} className="px-4 py-2 bg-primary/20 text-primary rounded-xl text-xs font-black hover:bg-primary/30 transition-all">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Save */}
                            <div className="flex gap-4 pt-4 border-t border-white/5">
                                <button onClick={closeEditor} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all">
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !form.name || !form.slug}
                                    className="flex-1 py-4 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {isCreating ? "Créer le Plan" : "Sauvegarder"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
