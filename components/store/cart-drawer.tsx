"use client";

import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, CreditCard, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/store/cart-context";
import { useCurrency } from "@/lib/theme-engine/currency-context";
import { formatPrice } from "@/lib/currency-engine";
import { Store } from "@/lib/supabase/types";
import { useState } from "react";
import Image from "next/image";
import { PaymentModal } from "./payment-modal";

export function CartDrawer({ store }: { store: Store }) {
    const { items, isCartOpen, closeCart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { currency } = useCurrency();
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    if (!isCartOpen) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeCart}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-[#08080A] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[101] flex flex-col"
            >
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                        <h2 className="font-display font-bold text-xl text-white">Mon Panier</h2>
                        <span className="bg-white/10 text-white/60 text-xs px-2 py-1 rounded-full font-bold">
                            {items.length}
                        </span>
                    </div>
                    <button
                        onClick={closeCart}
                        className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                            <ShoppingBag className="w-16 h-16" />
                            <p className="text-sm font-bold uppercase tracking-wider">Votre panier est vide</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="w-20 h-24 rounded-lg overflow-hidden bg-white/5 relative flex-shrink-0">
                                    {item.product.images?.[0] && (
                                        <Image
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-white text-sm line-clamp-2">{item.product.name}</h4>
                                        <p className="text-white/40 text-xs mt-1">
                                            {item.color && item.color !== 'default' && <span className="mr-2">{item.color}</span>}
                                            {item.size && item.size !== 'default' && <span>{item.size}</span>}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-white text-sm">
                                                {formatPrice(item.product.price * item.quantity, currency)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-white/20 hover:text-red-500 transition-colors self-start"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-6 bg-white/[0.02] border-t border-white/5 space-y-4">
                        <div className="flex justify-between items-center text-white/60 text-sm">
                            <span>Sous-total</span>
                            <span>{formatPrice(cartTotal, currency)}</span>
                        </div>
                        <div className="flex justify-between items-center text-white font-bold text-xl">
                            <span>Total</span>
                            <span className="text-primary">{formatPrice(cartTotal, currency)}</span>
                        </div>

                        <div className="pt-2 space-y-2">
                            <button
                                onClick={() => setIsPaymentOpen(true)}
                                className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(254,117,1,0.2)]"
                            >
                                <CreditCard className="w-4 h-4" />
                                Passer au paiement
                            </button>

                            <div className="flex items-center justify-center gap-2 text-[10px] text-white/30 uppercase tracking-wider font-bold">
                                <Lock className="w-3 h-3" />
                                Paiement Sécurisé & Chiffré
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                store={store}
                totalAmount={cartTotal}
                items={items}
                onSuccess={() => {
                    clearCart();
                    setIsPaymentOpen(false);
                    closeCart();
                }}
            />
        </>
    );
}
