"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Crown, Zap, Target, Star, Shield, Check, ArrowRight,
    CreditCard, Calendar, Loader2, AlertTriangle, Rocket,
    Store, BarChart3, Globe, Cpu, Eye, Users, MessageSquare
} from "lucide-react";
import { subscribeToPlan } from "@/lib/actions/plans";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ICON_MAP: Record<string, any> = { Zap, Target, Crown, Star, Shield };

const PAYMENT_METHODS = [
    { id: "orange_money", label: "Orange Money", icon: "🟠" },
    { id: "flutterwave", label: "Flutterwave", icon: "💳" },
    { id: "kkiapay", label: "KKiaPay", icon: "💰" },
    { id: "fedapay", label: "FedaPay", icon: "🏦" },
    { id: "stripe", label: "Stripe", icon: "💎" },
    { id: "paypal", label: "PayPal", icon: "🅿️" },
];

interface SubscriptionDashboardProps {
    currentPlan: any;
    subscription: any;
    allPlans: any[];
    storeCount: number;
}

export function SubscriptionDashboard({ currentPlan, subscription, allPlans, storeCount }: SubscriptionDashboardProps) {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<string>("");
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const handleUpgrade = async () => {
        if (!selectedPlan || !selectedPayment) {
            toast.error("Veuillez sélectionner un plan et un moyen de paiement");
            return;
        }
        setIsUpgrading(true);
        try {
            const res = await subscribeToPlan(selectedPlan, selectedPayment);
            if (res.error) throw new Error(res.error);
            toast.success("Abonnement activé avec succès !");
            setShowUpgradeModal(false);
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsUpgrading(false);
        }
    };

    const planFeatureIcons: Record<string, any> = {
        has_analytics: { icon: BarChart3, label: "Analytics Premium" },
        has_seo_ai: { icon: Cpu, label: "SEO IA" },
        has_viral_hub: { icon: MessageSquare, label: "Viral Hub" },
        has_vto_3d: { icon: Eye, label: "Virtual Try-On" },
        has_api_access: { icon: Globe, label: "API Custom" },
        has_custom_domain: { icon: Globe, label: "Domaine Custom" },
        has_multi_admin: { icon: Users, label: "Multi-Comptes" },
    };

    return (
        <div className="space-y-10">
            {/* Current Plan Card */}
            <div className="volcanic-glass p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Crown className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase italic">{currentPlan?.plan_name || "Aucun Plan"}</h2>
                                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                                        {subscription?.status === "active" ? "Abonnement Actif" :
                                            subscription?.status === "trial" ? "Période d'Essai" :
                                                "Non abonné"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {subscription?.status && (
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Fin de période</p>
                                    <p className="text-sm font-black text-white">
                                        {subscription.current_period_end
                                            ? new Date(subscription.current_period_end).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                                            : "—"}
                                    </p>
                                </div>
                                <Calendar className="w-5 h-5 text-primary/40" />
                            </div>
                        )}
                    </div>

                    {/* Usage Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                            <Store className="w-4 h-4 text-white/20 mb-2" />
                            <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Boutiques</p>
                            <p className="text-lg font-black text-white">
                                {storeCount} <span className="text-xs text-white/20">/ {currentPlan?.max_stores === -1 ? "∞" : currentPlan?.max_stores || 0}</span>
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                            <Cpu className="w-4 h-4 text-white/20 mb-2" />
                            <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Photos IA</p>
                            <p className="text-lg font-black text-white">
                                {currentPlan?.max_photos_sync === -1 ? "∞" : currentPlan?.max_photos_sync || 0}
                                <span className="text-xs text-white/20"> /mois</span>
                            </p>
                        </div>

                        {Object.entries(planFeatureIcons).slice(0, 2).map(([key, { icon: Icon, label }]) => (
                            <div key={key} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                                <Icon className="w-4 h-4 text-white/20 mb-2" />
                                <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">{label}</p>
                                <p className={`text-lg font-black ${currentPlan?.[key] ? 'text-emerald-400' : 'text-red-400/40'}`}>
                                    {currentPlan?.[key] ? "Activé" : "Verrouillé"}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Upgrade CTA */}
                    {currentPlan?.plan_slug !== "empire" && (
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="mt-6 flex items-center gap-2 px-8 py-4 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                        >
                            <Rocket className="w-4 h-4" />
                            Changer de Plan
                        </button>
                    )}
                </div>
            </div>

            {/* Feature Gates Overview */}
            <div className="volcanic-glass p-8 space-y-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Fonctionnalités de votre Plan</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(planFeatureIcons).map(([key, { icon: Icon, label }]) => {
                        const isActive = currentPlan?.[key];
                        return (
                            <div key={key} className={`p-4 rounded-2xl border transition-all ${isActive ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.01] border-white/5 opacity-40'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-white/20'}`} />
                                    {isActive ? <Check className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-white/10" />}
                                </div>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-400' : 'text-white/20'}`}>{label}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Upgrade Modal */}
            <AnimatePresence>
                {showUpgradeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
                        onClick={(e) => e.target === e.currentTarget && setShowUpgradeModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-4xl volcanic-glass p-8 space-y-8 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-black text-white uppercase italic">Choisissez votre Plan</h3>
                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Sélectionnez un plan puis un moyen de paiement</p>
                            </div>

                            {/* Plans Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {allPlans.map((plan: any) => {
                                    const IconComp = ICON_MAP[plan.icon_name] || Zap;
                                    const isSelected = selectedPlan === plan.slug;
                                    const isCurrent = plan.slug === currentPlan?.plan_slug;
                                    return (
                                        <button
                                            key={plan.id}
                                            onClick={() => !isCurrent && setSelectedPlan(plan.slug)}
                                            disabled={isCurrent}
                                            className={`p-6 rounded-2xl border text-left transition-all ${isSelected ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20 scale-[1.02]' :
                                                    isCurrent ? 'border-emerald-500/20 bg-emerald-500/5 opacity-60' :
                                                        'border-white/5 bg-white/[0.02] hover:border-white/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <IconComp className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-white/30'}`} />
                                                <span className="text-sm font-black text-white uppercase">{plan.name}</span>
                                                {isCurrent && (
                                                    <span className="ml-auto px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[7px] font-black uppercase tracking-widest rounded-full">Actuel</span>
                                                )}
                                            </div>
                                            <div className="mb-3">
                                                {plan.is_custom_price ? (
                                                    <span className="text-lg font-black text-white">Sur devis</span>
                                                ) : (
                                                    <span className="text-lg font-black text-white">{plan.price.toLocaleString()} <span className="text-[9px] text-white/30">FCFA/mois</span></span>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                {(plan.features_list || []).slice(0, 3).map((f: string) => (
                                                    <div key={f} className="flex items-center gap-2">
                                                        <Check className="w-2.5 h-2.5 text-primary/60" />
                                                        <span className="text-[9px] text-white/40 font-medium">{f}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Payment Method Selection */}
                            {selectedPlan && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Moyen de Paiement</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {PAYMENT_METHODS.map(pm => (
                                            <button
                                                key={pm.id}
                                                onClick={() => setSelectedPayment(pm.id)}
                                                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${selectedPayment === pm.id
                                                        ? 'border-primary/40 bg-primary/5'
                                                        : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                                                    }`}
                                            >
                                                <span className="text-xl">{pm.icon}</span>
                                                <span className="text-[10px] font-black text-white uppercase tracking-wider">{pm.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Confirm */}
                            <div className="flex gap-4 pt-4 border-t border-white/5">
                                <button onClick={() => setShowUpgradeModal(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all">
                                    Annuler
                                </button>
                                <button
                                    onClick={handleUpgrade}
                                    disabled={!selectedPlan || !selectedPayment || isUpgrading}
                                    className="flex-1 py-4 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:scale-[1.01] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-40"
                                >
                                    {isUpgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                                    Confirmer l&apos;Abonnement
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
