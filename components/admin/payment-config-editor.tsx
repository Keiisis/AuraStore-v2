"use client";

import React, { useState, useEffect } from "react";
import {
    CreditCard,
    ShieldCheck,
    Zap,
    MessageSquare,
    Lock,
    Save,
    Globe,
    Smartphone,
    Wallet,
    Info,
    ChevronDown,
    Search,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface PaymentConfig {
    id: string;
    provider: string;
    config_data: any;
    is_active: boolean;
}

const CATEGORIES = [
    { id: 'global', name: 'Global Tech Giants', icon: Globe, providers: ['stripe', 'paypal'] },
    { id: 'africa', name: 'African Powerhouses', icon: ShieldCheck, providers: ['cinetpay', 'fedapay', 'kkiapay'] },
    { id: 'mobile', name: 'Mobile Banking', icon: Smartphone, providers: ['mtn_money', 'moov_money', 'moneco', 'zeyow'] },
    { id: 'concierge', name: 'Elite Services', icon: MessageSquare, providers: ['whatsapp'] }
];

const PROVIDER_NAMES: Record<string, string> = {
    stripe: "Stripe Precision",
    paypal: "PayPal Global",
    cinetpay: "CinetPay Interlink",
    fedapay: "FedaPay Matrix",
    kkiapay: "Kkiapay Core",
    zeyow: "Zeyow Flow",
    moneco: "Moneco Vault",
    mtn_money: "MTN Money Bridge",
    moov_money: "Moov Money Pulse",
    whatsapp: "Aura Concierge (WhatsApp)"
};

export function PaymentConfigEditor() {
    const [configs, setConfigs] = useState<PaymentConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('global');

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await fetch("/api/admin/payment-config");
            const data = await res.json();
            if (data.configs) setConfigs(data.configs);
        } catch (err) {
            toast.error("Échec de la synchronisation de l'infrastructure");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (id: string, provider: string, configData: any, isActive: boolean) => {
        setSavingId(provider);
        try {
            const res = await fetch("/api/admin/payment-config", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, provider, config_data: configData, is_active: isActive })
            });
            if (res.ok) {
                toast.success(`Infrastructure ${PROVIDER_NAMES[provider] || provider} Sécurisée`);
                fetchConfigs();
            } else {
                toast.error("Échec de la liaison chiffrée");
            }
        } catch (err) {
            toast.error("Erreur de protocole financier");
        } finally {
            setSavingId(null);
        }
    };

    const updateConfigField = (provider: string, field: string, value: string) => {
        setConfigs(prev => prev.map(c => {
            if (c.provider === provider) {
                return { ...c, config_data: { ...c.config_data, [field]: value } };
            }
            return c;
        }));
    };

    const renderFields = (config: PaymentConfig) => {
        const fields = Object.keys(config.config_data);

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {fields.map(field => (
                    <div key={field} className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                            {field.replace(/_/g, ' ')}
                            <Info className="w-3 h-3 cursor-help text-white/10 hover:text-primary transition-colors" />
                        </label>
                        <div className="relative group">
                            <input
                                type={field.includes('secret') || field.includes('key') || field.includes('token') ? "password" : "text"}
                                value={config.config_data[field] || ""}
                                onChange={(e) => updateConfigField(config.provider, field, e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-5 py-3 text-xs text-white focus:outline-none focus:border-primary/40 transition-all font-mono group-hover:border-white/10"
                                placeholder={`Insérer ${field}...`}
                            />
                            <div className="absolute inset-y-0 right-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Lock className="w-3 h-3 text-white/20" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Initialisation du Nexus Financier...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Category Navigation */}
            <div className="flex items-center gap-2 bg-white/[0.02] p-1.5 rounded-[2rem] border border-white/5 overflow-x-auto whitespace-nowrap scrollbar-hide">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === cat.id
                                ? 'bg-primary text-black shadow-[0_0_20px_rgba(254,117,1,0.3)]'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <cat.icon className="w-4 h-4" />
                        {cat.name}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 gap-6"
                >
                    {CATEGORIES.find(c => c.id === activeTab)?.providers.map(provider => {
                        const config = configs.find(c => c.provider === provider) || {
                            id: '',
                            provider,
                            config_data: {},
                            is_active: false
                        };

                        return (
                            <div
                                key={provider}
                                className={`volcanic-glass p-8 border-white/5 relative overflow-hidden group transition-all duration-500 ${config.is_active ? 'hover:border-primary/30 border-primary/10' : 'opacity-60 grayscale'
                                    }`}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 ${config.is_active
                                                ? 'bg-primary/10 border-primary/20 text-primary shadow-[0_0_30px_rgba(254,117,1,0.1)]'
                                                : 'bg-white/5 border-white/10 text-white/20'
                                            }`}>
                                            {provider === 'whatsapp' ? <MessageSquare className="w-8 h-8" /> : (provider === 'paypal' || provider === 'stripe' ? <Globe className="w-8 h-8" /> : <Smartphone className="w-8 h-8" />)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">
                                                {PROVIDER_NAMES[provider]}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${config.is_active
                                                        ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
                                                        : 'text-white/20 border-white/5'
                                                    }`}>
                                                    {config.is_active ? 'Opérationnel' : 'Hors-Ligne'}
                                                </span>
                                                <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest italic flex items-center gap-1">
                                                    <Lock className="w-2.5 h-2.5" /> Chiffrement Quantum v2
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleSave(config.id, provider, config.config_data, !config.is_active)}
                                            className={`px-8 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${config.is_active
                                                    ? 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white'
                                                    : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                                }`}
                                        >
                                            {config.is_active ? 'Neutraliser' : 'Activer Passerelle'}
                                        </button>

                                        <button
                                            onClick={() => handleSave(config.id, provider, config.config_data, config.is_active)}
                                            disabled={savingId === provider || !config.is_active}
                                            className="px-8 py-3 rounded-xl bg-primary text-black font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-30 shadow-[0_0_30px_rgba(254,117,1,0.2)]"
                                        >
                                            {savingId === provider ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Save className="w-3 h-3" />
                                            )}
                                            Synchroniser
                                        </button>
                                    </div>
                                </div>

                                {config.is_active && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="border-t border-white/5 mt-8 pt-8"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-3 h-3 text-primary" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Paramètres de Transmission</span>
                                            </div>
                                            <p className="text-[8px] text-white/20 font-mono">ID: {config.id || 'NEXUS_TEMP'}</p>
                                        </div>

                                        {renderFields(config)}

                                        <div className="mt-8 flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                            <Info className="w-4 h-4 text-primary/40 flex-shrink-0" />
                                            <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-wider font-bold">
                                                Assurez-vous que les webhooks sont pointés vers <code className="text-primary font-mono lowercase tracking-normal">https://{window.location.host}/api/webhooks/{provider}</code> pour une réception en temps réel.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        );
                    })}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
