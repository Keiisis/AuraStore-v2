"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Camera,
    Sparkles,
    X,
    Scan,
    Loader2,
    CheckCircle2,
    Image as ImageIcon,
    RefreshCw,
    User,
    MessageSquare,
    Zap,
    ArrowRight
} from "lucide-react";
import { Product } from "@/lib/supabase/types";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface AuraVtoLabProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    storeId: string;
}

export function AuraVtoLab({ product, isOpen, onClose, storeId }: AuraVtoLabProps) {
    const supabase = createClient();
    const [userImage, setUserImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [engineMode, setEngineMode] = useState<'premium' | 'open-source' | null>(null);
    const [step, setStep] = useState<'upload' | 'lead' | 'analyzing' | 'result'>('upload');

    // Lead Form State
    const [leadName, setLeadName] = useState("");
    const [leadWhatsApp, setLeadWhatsApp] = useState("");
    const [isSubmittingLead, setIsSubmittingLead] = useState(false);
    const [aiMarketingMessage, setAiMarketingMessage] = useState("");
    const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = async () => {
        setShowCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            toast.error("Accès caméra refusé.");
            setShowCamera(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        setShowCamera(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setUserImage(dataUrl);
            stopCamera();
        }
    };

    const getProductType = () => {
        const name = (product?.name || "").toLowerCase();
        const category = (product?.category || "").toLowerCase();
        if (name.includes("montre") || name.includes("watch") || category.includes("accessoire")) return "accessory";
        if (name.includes("chaussure") || name.includes("sneaker")) return "footwear";
        return "garment";
    };

    const productType = getProductType();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!leadName || !leadWhatsApp) {
            toast.error("Veuillez remplir tous les champs.");
            return;
        }
        setIsSubmittingLead(true);

        try {
            const { createVtoLead } = await import("@/lib/actions/vto");
            const result = await createVtoLead({
                store_id: storeId,
                product_id: product.id,
                customer_name: leadName,
                customer_whatsapp: leadWhatsApp,
                user_photo_url: userImage || "",
            });

            if (result.error) throw new Error(result.error);
            if (result.lead) {
                setCurrentLeadId(result.lead.id);
            }

            setStep('analyzing');
            startTryOn();
        } catch (error: any) {
            console.error("Lead submission error:", error);
            toast.error(error.message || "Erreur d'enregistrement.");
        } finally {
            setIsSubmittingLead(false);
        }
    };

    const startTryOn = async () => {
        if (!userImage) return;
        setIsGenerating(true);
        try {
            const response = await fetch('/api/ai/vto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userPhoto: userImage,
                    productPhoto: product.images?.[0] || "",
                    productType: productType,
                    productDescription: product.name + ": " + product.description,
                    storeId: storeId
                })
            });
            const data = await response.json();
            if (data.imageUrl) {
                setResultImage(data.imageUrl);
                setEngineMode(data.mode);
                setStep('result');

                // Update lead result via server action
                if (currentLeadId) {
                    const { updateVtoLeadResult } = await import("@/lib/actions/vto");
                    await updateVtoLeadResult(currentLeadId, data.imageUrl);
                }

                // Generate AI Marketing Message via Groq
                try {
                    const copyResponse = await fetch('/api/ai/copywriter', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            productName: product.name,
                            customerName: leadName
                        })
                    });
                    const copyData = await copyResponse.json();
                    if (copyData.message) {
                        setAiMarketingMessage(copyData.message);
                    }
                } catch (e) {
                    console.error("AI Copy failed:", e);
                }

                toast.success("Fusion Aura terminée !");
            } else {
                throw new Error("Erreur fusion");
            }
        } catch (error) {
            toast.error("Échec de la fusion.");
            setStep('upload');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                        className="bg-[#0A0A0C] border border-white/10 rounded-[2.5rem] w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative"
                    >
                        {/* Aura Cinematic Glow Backdrop */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
                        </div>

                        {/* Header */}
                        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02] relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-display font-black text-lg text-white tracking-tight uppercase italic">Aura VTO Lab™</h3>
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Essayage Privilégié par Intelligence de Fusion</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/40 transition-all"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden relative z-10">
                            {/* Left Panel */}
                            <div className="p-8 border-r border-white/5 flex flex-col gap-6 bg-black/20 overflow-y-auto scrollbar-hide">
                                {step === 'upload' ? (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <h4 className="text-white font-black text-xs uppercase tracking-widest">Préparation Visuelle</h4>
                                            <p className="text-[10px] text-white/30 uppercase mt-2 font-bold tracking-tight">Capturez votre style pour une fusion parfaite.</p>
                                        </div>

                                        <div className={`aspect-[3/4] rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center group cursor-pointer overflow-hidden relative ${userImage || showCamera ? 'border-primary/40' : 'border-white/10 hover:border-primary/20 hover:bg-primary/5'}`}>
                                            {showCamera ? (
                                                <div className="relative w-full h-full">
                                                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                                                    <div className="absolute inset-x-0 bottom-6 flex justify-center gap-4">
                                                        <button onClick={(e) => { e.stopPropagation(); capturePhoto(); }} className="w-14 h-14 rounded-full bg-primary flex items-center justify-center border-4 border-black/20"><Camera className="w-6 h-6 text-black" /></button>
                                                        <button onClick={(e) => { e.stopPropagation(); stopCamera(); }} className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10"><X className="w-6 h-6 text-white" /></button>
                                                    </div>
                                                </div>
                                            ) : userImage ? (
                                                <div className="relative w-full h-full">
                                                    <img src={userImage} className="w-full h-full object-cover" alt="User" />
                                                    <button onClick={(e) => { e.stopPropagation(); setUserImage(null); }} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"><X className="w-4 h-4" /></button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-4 py-12" onClick={() => fileInputRef.current?.click()}>
                                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10"><ImageIcon className="w-6 h-6 text-white/20" /></div>
                                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest text-center">Déposer ou Capturer une Photo</p>
                                                </div>
                                            )}
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                            <canvas ref={canvasRef} className="hidden" />
                                        </div>

                                        {!showCamera && !userImage && (
                                            <button onClick={startCamera} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black uppercase text-[9px] tracking-widest hover:bg-white/10 flex items-center justify-center gap-2 transition-all">
                                                <Camera className="w-4 h-4" /> Activer l'Optique Aura
                                            </button>
                                        )}

                                        {userImage && (
                                            <motion.button
                                                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                                onClick={() => setStep('lead')}
                                                className="w-full h-16 rounded-2xl bg-primary text-black font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                            >
                                                Continuer vers l'Essayage <ArrowRight className="w-5 h-5" />
                                            </motion.button>
                                        )}
                                    </div>
                                ) : step === 'lead' ? (
                                    <div className="h-full flex flex-col justify-center items-center">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="w-full max-w-[340px] space-y-8"
                                        >
                                            <div className="text-center space-y-3">
                                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto border border-primary/20">
                                                    <Zap className="w-8 h-8 text-primary animate-pulse" />
                                                </div>
                                                <h4 className="text-white font-black text-xl uppercase italic tracking-tighter">Accès Privilégié Aura</h4>
                                                <p className="text-[10px] text-white/30 uppercase font-bold leading-relaxed tracking-widest">
                                                    Entrez vos coordonnées pour recevoir votre essayage personnalisé par WhatsApp et débloquer la fusion.
                                                </p>
                                            </div>

                                            <form onSubmit={handleLeadSubmit} className="space-y-4">
                                                <div className="space-y-4">
                                                    <div className="relative group">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                                        <input
                                                            type="text"
                                                            value={leadName}
                                                            onChange={(e) => setLeadName(e.target.value)}
                                                            placeholder="VOTRE NOM COMPLET"
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-[10px] font-black text-white uppercase tracking-widest placeholder:text-white/10 focus:outline-none focus:border-primary/50 transition-all"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="relative group">
                                                        <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                                        <input
                                                            type="tel"
                                                            value={leadWhatsApp}
                                                            onChange={(e) => setLeadWhatsApp(e.target.value)}
                                                            placeholder="NUMÉRO WHATSAPP (AVEC INDICATIF)"
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-[10px] font-black text-white uppercase tracking-widest placeholder:text-white/10 focus:outline-none focus:border-primary/50 transition-all"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    disabled={isSubmittingLead}
                                                    type="submit"
                                                    className="w-full h-16 rounded-2xl bg-primary text-black font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                                >
                                                    {isSubmittingLead ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Scan className="w-5 h-5" /> Débloquer la Fusion IA</>}
                                                </button>
                                            </form>
                                        </motion.div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-12">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full border-2 border-primary/10 border-t-primary animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-6 h-6 text-primary animate-pulse" /></div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-white font-black text-sm uppercase italic tracking-widest">Fusion Aura en cours...</h4>
                                            <p className="text-[9px] text-white/30 uppercase font-bold tracking-[0.2em] max-w-[200px] leading-relaxed italic">Intelligence Artificielle en action : Conservation morphologique et application des textures...</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Panel */}
                            <div className="p-8 flex flex-col items-center justify-center bg-black/40 relative">
                                <div className="absolute top-8 right-8 scale-75 origin-top-right">
                                    <div className="glass-card p-4 rounded-3xl border border-white/10 flex items-center gap-4 shadow-2xl">
                                        <img src={product.images?.[0] || ""} className="w-12 h-12 rounded-xl object-cover" alt="S" />
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-white uppercase tracking-tight">{product.name}</p>
                                            <p className="text-[8px] font-bold text-primary uppercase tracking-[0.2em]">SÉLECTION ÉLITE</p>
                                        </div>
                                    </div>
                                </div>

                                {step === 'result' ? (
                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-[360px] space-y-6">
                                        <div className="relative">
                                            <div className="aspect-[3/4] rounded-[3rem] overflow-hidden border border-primary/30 shadow-[0_0_50px_rgba(254,117,1,0.15)] relative group cursor-zoom-in">
                                                <img src={resultImage || ""} className="w-full h-full object-cover" alt="Res" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                                                    <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 px-4 py-3 rounded-2xl flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                        </div>
                                                        <div className="text-left w-full">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="block text-[10px] font-black text-emerald-500 uppercase tracking-tight italic leading-tight">Aura AI Marketing</span>
                                                                <span className={`text-[7px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border ${engineMode === 'premium' ? 'border-primary text-primary bg-primary/10' : 'border-white/20 text-white/40 bg-white/5'}`}>
                                                                    Moteur {engineMode === 'premium' ? 'Elite' : 'Open-Source'}
                                                                </span>
                                                            </div>
                                                            <span className="block text-[11px] text-white font-black leading-tight tracking-tight">
                                                                {aiMarketingMessage || "Tu vois comment c'est magnifique sur toi ? Lance ta commande maintenant !"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button onClick={() => setStep('upload')} className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-white/60 font-black uppercase text-[9px] tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                                <RefreshCw className="w-3 h-3" /> Changer de Style
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const punchline = aiMarketingMessage ? `\n\n_"${aiMarketingMessage}"_` : "";
                                                    const text = `Salut ! Je viens d'essayer le produit *${product.name}* via Aura VTO™ et je suis bluffé ! Voici mon essayage.${punchline}`;
                                                    const url = `https://wa.me/${leadWhatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
                                                    window.open(url, '_blank');
                                                }}
                                                className="flex-1 py-4 rounded-xl bg-emerald-500 text-black font-black uppercase text-[9px] tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                            >
                                                <MessageSquare className="w-3 h-3 fill-current" /> Partager résultat
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center gap-8 opacity-20">
                                        <div className="relative">
                                            <Scan className="w-32 h-32 text-white" />
                                            <motion.div
                                                animate={{ top: ['0%', '100%', '0%'] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                className="absolute left-0 right-0 h-1 bg-primary/80 blur-[2px] shadow-[0_0_15px_#FE7501]"
                                            />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-[10px] font-black text-white uppercase tracking-[0.5em] italic">Aura Intelligence Visualization Engine</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
