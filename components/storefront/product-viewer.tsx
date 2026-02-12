"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product, Store } from "@/lib/supabase/types";
import { ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Zap, ShieldCheck, Eye, Sparkles, X, Package } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Aura3DViewer } from "./aura-3d-engine";
import { AuraVtoLab } from "./aura-vto-lab";

interface ProductViewerProps {
    product: Product;
    store: Store;
}

import { useCurrency } from "@/lib/theme-engine/currency-context";
import { formatPrice } from "@/lib/currency-engine";
import { useCart } from "@/components/store/cart-context";
import { Plus, Minus } from "lucide-react";

export function ProductViewer({ product, store }: ProductViewerProps) {
    const { currency } = useCurrency();
    const { addToCart } = useCart();
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isVTOOpen, setIsVTOOpen] = useState(false);
    const [isVTOLabOpen, setIsVTOLabOpen] = useState(false);

    const images = product.images || [];
    const displayImages = images.length > 0 ? images : ["/placeholder-product.png"];

    const attributes = (product.attributes as Record<string, any>) || {};
    const availableSizes = attributes.sizes || [];
    const availableColors = attributes.colors || [];

    const handleWhatsAppPurchase = () => {
        // Retrieve phone number from store settings or use default
        const phoneNumber = store?.whatsapp_number || "2250707070707";

        const variantText = [];
        if (selectedColor) variantText.push(`Couleur: ${selectedColor}`);
        if (selectedSize) variantText.push(`Taille: ${selectedSize}`);
        const variantString = variantText.length > 0 ? ` (${variantText.join(", ")})` : "";

        const currentUrl = window.location.href;
        const message = `Bonjour équipe *${store?.name || "Aura Streetwear"}* 🎩,\n\nJe suis intéressé par cette pièce : *${product.name}*${variantString}.\n\n🔗 ${currentUrl}\n\nPrix: *${formatPrice(product.price, currency)}*.\nEst-ce disponible pour un achat immédiat ? ✨`;

        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    };

    const handleAddToCart = () => {
        addToCart(
            product,
            quantity,
            selectedColor || (availableColors.length > 0 ? availableColors[0] : null),
            selectedSize || (availableSizes.length > 0 ? availableSizes[0] : null)
        );
    };

    const handleWishlist = () => {
        toast.success("Ajouté à la wishlist ! ❤️");
    };

    const handleShare = async () => {
        const shareData = {
            title: product.name,
            text: `Regarde cette pépite sur ${store.name} : ${product.name} ! ✨`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Lien copié ! Propager l'Aura... 🚀");
            }
        } catch (err) {
            console.error("Share failed", err);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Left Column: Gallery */}
                <div className="space-y-4">
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden glass-card border border-white/5 group">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedImage}
                                initial={{ opacity: 0, scale: 1.2, rotateY: 45 }}
                                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                exit={{ opacity: 0, scale: 0.9, rotateY: -45 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 20,
                                    duration: 0.8
                                }}
                                className="w-full h-full perspective-1000"
                            >
                                <Image
                                    src={displayImages[selectedImage]}
                                    alt={product.name}
                                    fill
                                    priority
                                    className="object-cover"
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* VTO / 3D Trigger */}
                        {(product.vto_enabled || true) && (
                            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
                                <button
                                    onClick={() => setIsVTOOpen(true)}
                                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold hover:bg-primary transition-colors justify-center"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Visualiser 3D</span>
                                </button>
                                <button
                                    onClick={() => setIsVTOLabOpen(true)}
                                    className="bg-primary text-black px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_10px_20px_rgba(254,117,1,0.2)]"
                                >
                                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                                    <span>Essayer sur Moi</span>
                                </button>
                            </div>
                        )}

                        {/* Navigation Arrows */}
                        {displayImages.length > 1 && (
                            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                                <button
                                    onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1))}
                                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white pointer-events-auto hover:bg-primary transition-colors active:scale-95"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setSelectedImage((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0))}
                                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white pointer-events-auto hover:bg-primary transition-colors active:scale-95"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {displayImages.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {displayImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden transition-all ${selectedImage === idx
                                        ? "ring-2 ring-primary ring-offset-2 ring-offset-black scale-95"
                                        : "opacity-40 hover:opacity-100"
                                        }`}
                                >
                                    <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Details */}
                <div className="space-y-6 md:sticky md:top-24">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black tracking-[0.2em] text-primary uppercase bg-primary/10 px-2 py-1 rounded">
                                {product.category || "Collection 2026"}
                            </span>
                            {product.stock > 0 && (
                                <span className="text-[9px] font-bold text-green-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    En Stock
                                </span>
                            )}
                        </div>

                        <h1 className="font-display text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
                            {product.name}
                        </h1>

                        <div className="flex items-baseline gap-3 pt-1">
                            <span className="text-3xl font-black text-white">
                                {formatPrice(product.price || 0, currency)}
                            </span>
                            {product.compare_at_price && (
                                <span className="text-lg font-medium text-white/30 line-through">
                                    {formatPrice(product.compare_at_price, currency)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />

                    {/* Variants */}
                    {(availableColors.length > 0 || availableSizes.length > 0) && (
                        <div className="space-y-5">
                            {/* Colors */}
                            {availableColors.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                                        <span className="text-white/40">Couleur</span>
                                        <span className="text-white">{selectedColor || "Sélectionner"}</span>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {availableColors.map((hex: string) => (
                                            <button
                                                key={hex}
                                                onClick={() => setSelectedColor(hex)}
                                                className={`w-8 h-8 rounded-full border transition-all p-0.5 ${selectedColor === hex ? 'border-primary ring-2 ring-primary/20' : 'border-white/10 hover:border-white/30'}`}
                                                title={hex}
                                            >
                                                <div
                                                    className="w-full h-full rounded-full"
                                                    style={{ backgroundColor: hex }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sizes */}
                            {availableSizes.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                                        <span className="text-white/40">Taille</span>
                                        <button className="text-white/30 hover:text-white underline decoration-white/30">Guide</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {availableSizes.map((size: string) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`flex-1 min-w-[3rem] py-2 rounded-lg border font-bold text-xs transition-all ${selectedSize === size
                                                    ? "bg-white text-black border-white shadow-lg shadow-white/10"
                                                    : "bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:text-white"
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Additional Attributes Display */}
                    {(attributes.material || attributes.file_format || attributes.license || attributes.serial_number || attributes.limited_edition) && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            {attributes.material && (
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Matériau</p>
                                    <p className="text-xs text-white font-bold">{attributes.material}</p>
                                </div>
                            )}
                            {attributes.file_format && (
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Format</p>
                                    <p className="text-xs text-white font-bold">{attributes.file_format}</p>
                                </div>
                            )}
                            {attributes.license && (
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Licence</p>
                                    <p className="text-xs text-white font-bold">{attributes.license}</p>
                                </div>
                            )}
                            {attributes.serial_number && (
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Série</p>
                                    <p className="text-xs text-white font-bold uppercase">{attributes.serial_number}</p>
                                </div>
                            )}
                            {attributes.limited_edition && (
                                <div className="col-span-2 py-2 px-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-2 mt-2">
                                    <Sparkles className="w-3 h-3 text-primary" />
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Édition Limitée & Certifiée</span>
                                </div>
                            )}
                        </div>
                    )}


                    {/* Quantity & Actions */}
                    <div className="space-y-4 pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-14 flex items-center gap-3 bg-white/5 rounded-2xl p-1.5 border border-white/10 shadow-inner">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-11 h-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all active:scale-90"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-10 text-center font-black text-white text-lg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="w-11 h-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all active:scale-90"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <motion.button
                                onClick={handleWhatsAppPurchase}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 relative overflow-hidden bg-[#25D366] text-white h-14 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-[0.15em] transition-all shadow-[0_10px_30px_rgba(37,211,102,0.3)] hover:shadow-[0_15px_40px_rgba(37,211,102,0.4)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] hover:translate-x-[200%] transition-transform duration-1000" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-5 h-5 filter brightness-0 invert drop-shadow-md" alt="WhatsApp" />
                                <span>Acheter via WhatsApp</span>
                            </motion.button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <motion.button
                                onClick={handleAddToCart}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="h-14 rounded-2xl border border-primary bg-primary text-white flex items-center justify-center gap-3 font-black uppercase text-xs tracking-[0.2em] transition-all shadow-[0_10px_40px_rgba(254,117,1,0.2)] hover:shadow-[0_15px_50px_rgba(254,117,1,0.4)] group"
                            >
                                <ShoppingCart className="w-4 h-4 transition-transform group-hover:rotate-12" />
                                commander
                            </motion.button>

                            <motion.button
                                onClick={handleShare}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="h-14 rounded-2xl border border-primary/30 bg-white/[0.03] text-white flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] transition-all group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                                <Share2 className="w-4 h-4 text-primary group-hover:scale-125 transition-transform" />
                                <span className="relative z-10">Propager l'Aura</span>
                            </motion.button>
                        </div>

                        <div className="flex gap-3">
                            <motion.button
                                onClick={handleWishlist}
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.9 }}
                                className="flex-1 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-red-500 transition-colors"
                            >
                                <Heart className="w-5 h-5 mr-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Favoris</span>
                            </motion.button>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="pt-4 border-t border-white/5">
                        <p className="text-white/50 text-xs leading-relaxed">
                            {product.description || "Une pièce d'exception conçue pour ceux qui ne font aucun compromis sur le style et la performance."}
                        </p>
                    </div>

                    {/* Trust Indicators */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-white/40">
                            <Zap className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-medium">Livraison Express</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/40">
                            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-[10px] font-medium">Garantie Authentique</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* VTO Modal Overlay */}
            <AnimatePresence>
                {isVTOOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                    <h3 className="font-bold text-white text-sm">Visualisation 3D & Essayage</h3>
                                </div>
                                <button onClick={() => setIsVTOOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="aspect-square md:aspect-video bg-[#08080A] relative overflow-hidden">
                                <Aura3DViewer
                                    modelUrl={product.glb_url || undefined}
                                    productName={product.name}
                                    productImage={product.images?.[0]}
                                    storeId={store.id}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Aura VTO Lab Integration */}
            <AuraVtoLab
                product={product}
                isOpen={isVTOLabOpen}
                onClose={() => setIsVTOLabOpen(false)}
                storeId={store.id}
            />
        </div>
    );
}
