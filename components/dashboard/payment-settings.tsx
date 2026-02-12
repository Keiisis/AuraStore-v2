"use client";

import { useState } from "react";
import { CreditCard, Wallet, Smartphone, Globe, Lock, Save, Loader2, CheckCircle2 } from "lucide-react";
import { Store } from "@/lib/supabase/types";

interface PaymentSettingsProps {
    store: Store;
}

// Payment Methods Configuration
const PAYMENT_METHODS = [
    {
        id: "stripe",
        name: "Stripe",
        logo: "/payment/stripe.png",
        icon: <CreditCard className="w-5 h-5 text-indigo-500" />,
        fields: [
            { key: "stripe_public_key", label: "Clé Publique (Public Key)" },
            { key: "stripe_secret_key", label: "Clé Secrète (Secret Key)" },
        ],
        description: "Acceptez les cartes bancaires (Visa, MasterCard) à l'international.",
    },
    {
        id: "paypal",
        name: "PayPal",
        logo: "/payment/paypal.png",
        icon: <Wallet className="w-5 h-5 text-blue-500" />,
        fields: [
            { key: "paypal_client_id", label: "Client ID" },
            { key: "paypal_secret", label: "Secret Key" },
        ],
        description: "Paiements sécurisés via compte PayPal ou carte.",
    },
    {
        id: "flutterwave",
        name: "Flutterwave",
        logo: "/payment/flutterwave.png",
        icon: <Globe className="w-5 h-5 text-orange-500" />,
        fields: [
            { key: "flutterwave_public_key", label: "Public Key" },
            { key: "flutterwave_secret_key", label: "Secret Key" },
            { key: "flutterwave_encryption_key", label: "Encryption Key" },
        ],
        description: "Leader en Afrique. Mobile Money & Cartes.",
    },
    {
        id: "fedapay",
        name: "FedaPay",
        logo: "/payment/fedapay.png",
        icon: <Smartphone className="w-5 h-5 text-blue-400" />,
        fields: [
            { key: "fedapay_public_key", label: "Public Key" },
            { key: "fedapay_secret_key", label: "Secret Key" },
        ],
        description: "Agrégateur de paiement Mobile Money au Bénin et Togo.",
    },
    {
        id: "orange_money",
        name: "Orange Money",
        logo: "/payment/orange.png",
        icon: <Smartphone className="w-5 h-5 text-orange-600" />,
        fields: [
            { key: "orange_money_merchant_id", label: "Merchant ID" },
            { key: "orange_money_auth_token", label: "Authorization Token" },
        ],
        description: "Paiements mobiles en Afrique de l'Ouest.",
    },
    {
        id: "crypto",
        name: "Crypto (NOWPayments)",
        logo: "/payment/crypto.png",
        icon: <Wallet className="w-5 h-5 text-yellow-500" />,
        fields: [
            { key: "nowpayments_api_key", label: "API Key" },
        ],
        description: "Acceptez BTC, ETH, USDT et plus.",
    },
    {
        id: "kkiapay",
        name: "KkiaPay",
        logo: "/payment/kkiapay.png",
        icon: <Smartphone className="w-5 h-5 text-green-500" />,
        fields: [
            { key: "kkiapay_public_key", label: "Public Key" },
            { key: "kkiapay_private_key", label: "Private Key" },
            { key: "kkiapay_secret", label: "Secret" },
        ],
        description: "Solution de paiement simple pour le Bénin.",
    },
];

export function PaymentSettings({ store }: PaymentSettingsProps) {
    // Cast payment_config to any to avoid TS issues if it's strictly typed as Json
    const initialConfig = (store.payment_config as any) || {};

    // State for local changes before save
    const [config, setConfig] = useState<Record<string, string>>(initialConfig);

    const handleChange = (key: string, value: string) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-8">
            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <ShieldIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg mb-1">Paiements Sécurisés</h3>
                    <p className="text-white/60 text-sm">
                        Configurez vos passerelles de paiement. Les clés API sont stockées de manière chiffrée.
                        Vos clients verront ces options lors du paiement.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {PAYMENT_METHODS.map((method) => {
                    const isActive = config[`${method.id}_enabled`] === "true";

                    return (
                        <div key={method.id} className={`glass-card rounded-2xl border transition-all duration-300 ${isActive ? 'border-primary/30 bg-primary/[0.02]' : 'border-white/[0.05]'}`}>
                            <div className="p-6 space-y-6">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                            {method.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg">{method.name}</h4>
                                            <p className="text-white/40 text-xs mt-0.5">{method.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-primary' : 'text-white/20'}`}>
                                            {isActive ? 'Activé' : 'Désactivé'}
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                name={`${method.id}_enabled`}
                                                checked={isActive}
                                                onChange={(e) => handleChange(`${method.id}_enabled`, String(e.target.checked))}
                                            />
                                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                </div>

                                {/* Fields */}
                                {isActive && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {method.fields.map((field) => (
                                            <div key={field.key} className="space-y-2">
                                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">
                                                    {field.label}
                                                </label>
                                                <div className="relative group">
                                                    <input
                                                        type="password"
                                                        name={field.key}
                                                        value={config[field.key] || ""}
                                                        onChange={(e) => handleChange(field.key, e.target.value)}
                                                        placeholder="sk_live_..."
                                                        className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-sm text-white focus:outline-none focus:border-primary/40 transition-all font-mono placeholder:text-white/10 group-hover:bg-white/[0.04]"
                                                    />
                                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Hidden inputs for form submission */}
            {Object.entries(config).map(([key, value]) => (
                <input key={key} type="hidden" name={`payment_config.${key}`} value={value} />
            ))}
        </div>
    );
}

function ShieldIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
    )
}
