"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Wallet, Globe, Smartphone, CheckCircle2, Loader2, Lock, ArrowRight } from "lucide-react";
import { Store } from "@/lib/supabase/types";
import { useCurrency } from "@/lib/theme-engine/currency-context";
import { formatPrice } from "@/lib/currency-engine";
import { toast } from "sonner";
// import { createOrder } from "@/lib/actions/order"; // Dynamic import used below
import { createStripeCheckoutSession } from "@/lib/actions/stripe";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    store: Store;
    totalAmount: number;
    items: any[];
    onSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, store, totalAmount, items, onSuccess }: PaymentModalProps) {
    const { currency } = useCurrency();
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState<"info" | "method" | "details" | "success">("info");
    const [customerInfo, setCustomerInfo] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
    });

    // Retrieve active payment methods from store config
    const paymentConfig = (store.payment_config as any) || {};

    const availableMethods = [
        {
            id: "stripe",
            name: "Stripe Precision",
            icon: <CreditCard className="w-6 h-6 text-indigo-400" />,
            enabled: paymentConfig.stripe_enabled === "true" && !!paymentConfig.stripe_public_key
        },
        {
            id: "paypal",
            name: "PayPal Global",
            icon: <Wallet className="w-6 h-6 text-blue-400" />,
            enabled: paymentConfig.paypal_enabled === "true" && !!paymentConfig.paypal_client_id
        },
        {
            id: "cinetpay",
            name: "CinetPay Interlink",
            icon: <Globe className="w-6 h-6 text-orange-400" />,
            enabled: paymentConfig.cinetpay_enabled === "true" && !!paymentConfig.cinetpay_site_id
        },
        {
            id: "fedapay",
            name: "FedaPay Matrix",
            icon: <Smartphone className="w-6 h-6 text-blue-300" />,
            enabled: paymentConfig.fedapay_enabled === "true" && !!paymentConfig.fedapay_public_key
        },
        {
            id: "kkiapay",
            name: "KkiaPay Core",
            icon: <Smartphone className="w-6 h-6 text-green-400" />,
            enabled: paymentConfig.kkiapay_enabled === "true" && !!paymentConfig.kkiapay_public_key
        },
        {
            id: "zeyow",
            name: "Zeyow Flow",
            icon: <Smartphone className="w-6 h-6 text-emerald-400" />,
            enabled: paymentConfig.zeyow_enabled === "true"
        },
        {
            id: "moneco",
            name: "Moneco Vault",
            icon: <Wallet className="w-6 h-6 text-purple-400" />,
            enabled: paymentConfig.moneco_enabled === "true"
        },
        {
            id: "mtn_money",
            name: "MTN Money Bridge",
            icon: <Smartphone className="w-6 h-6 text-yellow-500" />,
            enabled: paymentConfig.mtn_money_enabled === "true" && !!paymentConfig.mtn_money_subscription_key
        },
        {
            id: "moov_money",
            name: "Moov Money Pulse",
            icon: <Smartphone className="w-6 h-6 text-blue-600" />,
            enabled: paymentConfig.moov_money_enabled === "true" && !!paymentConfig.moov_money_client_id
        }
    ].filter(m => m.enabled);

    // If no specific gateway is enabled, minimal default (e.g. simulation or manual)
    const hasMethods = availableMethods.length > 0;

    const handlePayment = async () => {
        if (!selectedMethod) return;

        setIsProcessing(true);

        try {
            // STRIPE PROCESSING
            if (selectedMethod === "stripe") {
                // Ensure items are properly formatted for Stripe Action
                const sanitizedItems = items.map(item => ({
                    name: item.name || item.product?.name || "Article d'exception",
                    price: Number(item.price || item.product?.price || 0),
                    image: item.image || (item.product?.images && item.product.images[0]) || "",
                    quantity: item.quantity || 1,
                    variant: item.variant || ""
                }));

                const result = await createStripeCheckoutSession({
                    storeId: store.id,
                    items: sanitizedItems,
                    currency: typeof currency === 'string' ? currency : (currency as any).code || "xof",
                    customerEmail: customerInfo.email,
                    successUrl: window.location.href.split('?')[0] + "?payment=success",
                    cancelUrl: window.location.href,
                });

                if (result.error) throw new Error(result.error);
                if (result.url) {
                    window.location.href = result.url;
                    return; // Stop here, redirecting
                }
            }

            // OTHER METHODS (Previous Logic / Manual Orders)
            // Import the action
            const { createOrder } = await import("@/lib/actions/order");

            // Create real order in Database
            const result = await createOrder({
                store_id: store.id,
                customer_name: customerInfo.name,
                customer_email: customerInfo.email,
                customer_phone: customerInfo.phone,
                items: items,
                subtotal: totalAmount,
                total: totalAmount,
                payment_method: selectedMethod as any,
                shipping_address: { address: customerInfo.address },
            });

            if (result.error) throw new Error(result.error);

            // Simulate Gateway Processing delay for non-redirect methods
            await new Promise(resolve => setTimeout(resolve, 1500));

            setIsProcessing(false);
            setStep("success");
            setTimeout(() => {
                onSuccess();
                toast.success("Commande confirmée ! 🚀");
            }, 1500);
        } catch (err: any) {
            toast.error(err.message || "Une erreur est survenue lors du paiement.");
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-lg bg-[#121216] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                        <div>
                            <h3 className="text-xl font-black text-white font-display">Caisse Sécurisée</h3>
                            <p className="text-white/40 text-xs font-medium">Total à payer: <span className="text-primary font-bold">{formatPrice(totalAmount, currency)}</span></p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto flex-1">
                        {step === "info" && (
                            <div className="space-y-6">
                                <p className="text-sm font-bold text-white/60 uppercase tracking-wider">Vos Informations</p>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Nom</label>
                                            <input
                                                type="text"
                                                value={customerInfo.name}
                                                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="Jean Dupont"
                                                className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-sm text-white focus:outline-none focus:border-primary/40 transition-all placeholder:text-white/10"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Téléphone</label>
                                            <input
                                                type="text"
                                                value={customerInfo.phone}
                                                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                                                placeholder="+225..."
                                                className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-sm text-white focus:outline-none focus:border-primary/40 transition-all placeholder:text-white/10"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Email</label>
                                        <input
                                            type="email"
                                            value={customerInfo.email}
                                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="jean@exemple.com"
                                            className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-sm text-white focus:outline-none focus:border-primary/40 transition-all placeholder:text-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Adresse de livraison</label>
                                        <input
                                            type="text"
                                            value={customerInfo.address}
                                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                                            placeholder="Rue, Quartier, Ville..."
                                            className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-sm text-white focus:outline-none focus:border-primary/40 transition-all placeholder:text-white/10"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (!customerInfo.name || !customerInfo.email || !customerInfo.address) {
                                            toast.error("Veuillez remplir tous les champs obligatoires");
                                            return;
                                        }
                                        setStep("method");
                                    }}
                                    className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    Suivant <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {step === "method" && (
                            <div className="space-y-6">
                                <p className="text-sm font-bold text-white/60 uppercase tracking-wider">Choisissez votre moyen de paiement</p>

                                {hasMethods ? (
                                    <div className="grid gap-3">
                                        {availableMethods.map((method) => (
                                            <button
                                                key={method.id}
                                                onClick={() => {
                                                    setSelectedMethod(method.id);
                                                    setStep("details");
                                                }}
                                                className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/50 hover:shadow-[0_0_20px_rgba(254,117,1,0.1)] transition-all group text-left"
                                            >
                                                <div className="w-12 h-12 rounded-lg bg-black/40 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-colors">
                                                    {method.icon}
                                                </div>
                                                <div>
                                                    <span className="block text-white font-bold">{method.name}</span>
                                                    <span className="text-xs text-white/30">Paiement sécurisé</span>
                                                </div>
                                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                                                    <CreditCard className="w-5 h-5" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                                        <Lock className="w-8 h-8 text-white/20 mx-auto mb-3" />
                                        <p className="text-white/40 text-sm">Aucune méthode de paiement en ligne configurée.</p>
                                        <p className="text-white/20 text-xs mt-1">Veuillez contacter le vendeur.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === "details" && (
                            <div className="space-y-6 text-center">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto border border-primary/20">
                                    <Lock className="w-8 h-8 text-primary" />
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-white font-bold text-lg">Confirmer le paiement</h4>
                                    <p className="text-white/40 text-sm">
                                        Vous allez payer <strong>{formatPrice(totalAmount, currency)}</strong> via <strong>{selectedMethod?.toUpperCase()}</strong>.
                                    </p>
                                </div>

                                <div className="bg-white/5 p-4 rounded-xl text-left border border-white/5">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-white/40">Articles</span>
                                        <span className="text-white">{items.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold border-t border-white/5 pt-2 mt-2">
                                        <span className="text-white">Total</span>
                                        <span className="text-primary">{formatPrice(totalAmount, currency)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Traitement...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Payer Maintenant
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => setStep("method")}
                                    className="text-white/40 hover:text-white text-xs underline"
                                >
                                    Changer de méthode
                                </button>
                            </div>
                        )}

                        {step === "success" && (
                            <div className="flex flex-col items-center justify-center h-full space-y-6 py-8">
                                <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center animate-bounce">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-black text-white text-center">Paiement Réussi !</h3>
                                <p className="text-white/40 text-center max-w-xs">
                                    Votre commande a été confirmée. Vous recevrez un email de récapitulatif.
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
