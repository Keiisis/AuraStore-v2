"use client";

import { useState } from "react";
import { createStore } from "@/lib/actions/store";
import { uploadImage } from "@/lib/actions/storage";
import {
    Zap,
    ArrowLeft,
    Loader2,
    Sparkles,
    Shirt,
    Cpu,
    Sparkle,
    Palette,
    Gem,
    Home,
    Dumbbell,
    Gamepad2,
    Briefcase,
    Image as ImageIcon,
    LayoutTemplate,
    Rocket,
    Globe,
    CheckCircle2,
    Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
    { id: "streetwear", label: "Streetwear", icon: Shirt, color: "from-orange-500 to-red-500" },
    { id: "techwear", label: "Techwear Luxe", icon: Cpu, color: "from-blue-500 to-cyan-500" },
    { id: "traditionnel", label: "Traditionnel", icon: Sparkle, color: "from-green-500 to-emerald-500" },
    { id: "sneakers", label: "Sneakers", icon: Gamepad2, color: "from-pink-500 to-rose-500" }, // Using Gamepad2 as placeholder for sneakers if no icon
    { id: "bijoux", label: "Bijoux", icon: Gem, color: "from-amber-300 to-yellow-500" },
    { id: "cosmetiques", label: "Cosmétiques", icon: Sparkle, color: "from-cyan-400 to-blue-500" },
    { id: "sacs", label: "Sacs & Étuis", icon: Briefcase, color: "from-orange-400 to-amber-600" },
    { id: "accessoires", label: "Accessoires", icon: Zap, color: "from-indigo-500 to-purple-600" },
    { id: "y2k", label: "Y2K Style", icon: Sparkle, color: "from-rose-400 to-purple-500" },
    { id: "minimalist", label: "Minimalist Couture", icon: Home, color: "from-slate-200 to-slate-400" },
];

export default function NewStorePage() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Form data state
    const [formData, setFormData] = useState({
        founder_name: "",
        name: "",
        slug: "",
        category: "",
        whatsapp_number: "",
        description: "",
        logo_url: "",
        banner_url: "",
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const updateFormData = (field: string, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            // Auto-generate slug from name if slug is empty or user is typing name
            if (field === "name" && (!prev.slug || prev.slug === prev.name.toLowerCase().replace(/ /g, "-"))) {
                newData.slug = value.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
            }
            return newData;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === 'logo') {
                setLogoFile(file);
                setLogoPreview(URL.createObjectURL(file));
            } else {
                setBannerFile(file);
                setBannerPreview(URL.createObjectURL(file));
            }
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        try {
            let finalLogoUrl = formData.logo_url;
            let finalBannerUrl = formData.banner_url;

            // Upload logo if file selected
            if (logoFile) {
                const logoFormData = new FormData();
                logoFormData.append("file", logoFile);
                const logoResult = await uploadImage(logoFormData);
                if (logoResult?.error) throw new Error(`Logo: ${logoResult.error}`);
                if (logoResult?.url) finalLogoUrl = logoResult.url;
            }

            // Upload banner if file selected
            if (bannerFile) {
                const bannerFormData = new FormData();
                bannerFormData.append("file", bannerFile);
                const bannerResult = await uploadImage(bannerFormData);
                if (bannerResult?.error) throw new Error(`Banner: ${bannerResult.error}`);
                if (bannerResult?.url) finalBannerUrl = bannerResult.url;
            }

            const result = await createStore({
                ...formData,
                logo_url: finalLogoUrl,
                banner_url: finalBannerUrl,
            } as any);

            if (result?.error) {
                if (typeof result.error === 'string') {
                    setError(result.error);
                } else {
                    setError("Erreur de validation. Vérifiez vos informations.");
                }
            }
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de l'upload.");
        } finally {
            setIsLoading(false);
        }
    };

    const isStep1Valid = formData.name.length >= 2 &&
        formData.slug.length >= 3 &&
        formData.category &&
        formData.founder_name.length >= 2 &&
        formData.whatsapp_number.length >= 8 &&
        formData.description.length >= 10;

    return (
        <div className="min-h-screen bg-[#08080A] flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden selection:bg-primary/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[140px] animate-pulse [animation-delay:3s]" />
            </div>

            <div className="w-full max-w-4xl relative z-10 space-y-8">
                {/* Header Section */}
                <div className="flex items-center justify-between px-2">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                        Sortir du hangar
                    </Link>

                    <div className="flex items-center gap-4">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-1 rounded-full transition-all duration-500 ${step >= s ? "w-8 bg-primary" : "w-4 bg-white/5"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                                    <Sparkles className="w-3 h-3 text-primary" />
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Phase 01: Concept</span>
                                </div>
                                <h1 className="font-display text-4xl font-black text-white tracking-tight">
                                    Définissez votre <span className="text-primary italic">Signature.</span>
                                </h1>
                                <p className="text-white/40 text-sm max-w-lg font-medium">Quel est le nom de votre futur empire et dans quel secteur comptez-vous dominer ?</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Votre Nom de Fondateur</label>
                                        <input
                                            value={formData.founder_name}
                                            onChange={(e) => updateFormData("founder_name", e.target.value)}
                                            placeholder="Ex: Kevin Chacha"
                                            className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Nom du Business</label>
                                        <input
                                            value={formData.name}
                                            onChange={(e) => updateFormData("name", e.target.value)}
                                            placeholder="Ex: Aura Streetwear"
                                            className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Identifiant Unique (URL)</label>
                                        <div className="relative group">
                                            <input
                                                value={formData.slug}
                                                onChange={(e) => updateFormData("slug", e.target.value)}
                                                placeholder="aura-streetwear"
                                                className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all font-bold"
                                            />
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/10 uppercase tracking-widest pointer-events-none group-focus-within:text-primary transition-colors">
                                                .aurastore.com
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Numéro WhatsApp Business</label>
                                        <input
                                            value={formData.whatsapp_number}
                                            onChange={(e) => updateFormData("whatsapp_number", e.target.value)}
                                            placeholder="Ex: 2250707070707"
                                            className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all font-bold"
                                        />
                                        <p className="text-[9px] text-white/20 pl-1 italic">Crucial: C'est ici que vous recevrez vos commandes.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Description de la Boutique</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => updateFormData("description", e.target.value)}
                                            placeholder="Décrivez votre univers en quelques mots..."
                                            rows={3}
                                            className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all font-bold resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Secteur d'activité</label>
                                    <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => updateFormData("category", cat.id)}
                                                className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-3 group relative overflow-hidden ${formData.category === cat.id
                                                    ? "bg-white/[0.05] border-primary"
                                                    : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.03]"
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-lg`}>
                                                    <cat.icon className="w-5 h-5" />
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${formData.category === cat.id ? "text-white" : "text-white/40 group-hover:text-white/60"
                                                    }`}>
                                                    {cat.label}
                                                </span>
                                                {formData.category === cat.id && (
                                                    <div className="absolute top-2 right-2">
                                                        <CheckCircle2 className="w-4 h-4 text-primary fill-black" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!isStep1Valid}
                                    className="px-10 py-4 bg-white text-black font-black rounded-2xl text-[11px] uppercase tracking-[0.25em] hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-white/5 disabled:opacity-30 disabled:scale-100 flex items-center gap-2 group"
                                >
                                    Phase Suivante
                                    <Rocket className="w-4 h-4 group-hover:animate-bounce" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full">
                                    <LayoutTemplate className="w-3 h-3 text-secondary" />
                                    <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Phase 02: Identité Visuelle</span>
                                </div>
                                <h1 className="font-display text-4xl font-black text-white tracking-tight">
                                    Importez votre <span className="text-secondary italic">Aura.</span>
                                </h1>
                                <p className="text-white/40 text-sm max-w-lg font-medium">Configurez les visuels qui accueilleront vos futurs clients d'élite.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Identité Visuelle (Logo)</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="relative group overflow-hidden">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, 'logo')}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                                />
                                                <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl group-hover:bg-white/[0.04] transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                                                            <Upload className="w-4 h-4 text-secondary" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-[11px] font-bold text-white">Importer votre Logo</p>
                                                            <p className="text-[9px] text-white/20 font-medium italic">Cliquez ou glissez-déposez</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 px-4 overflow-hidden">
                                                <div className="h-px flex-1 bg-white/[0.05]" />
                                                <span className="text-[9px] font-black text-white/10 uppercase">OU</span>
                                                <div className="h-px flex-1 bg-white/[0.05]" />
                                            </div>

                                            <div className="relative group">
                                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                                <input
                                                    value={formData.logo_url}
                                                    onChange={(e) => updateFormData("logo_url", e.target.value)}
                                                    placeholder="Lien URL de l'image"
                                                    className="w-full pl-12 pr-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-secondary/40 focus:bg-white/[0.04] transition-all font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Image de Couverture (Bannière)</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="relative group overflow-hidden">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, 'banner')}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                                />
                                                <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl group-hover:bg-white/[0.04] transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                                                            <Upload className="w-4 h-4 text-secondary" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-[11px] font-bold text-white">Importer votre Bannière</p>
                                                            <p className="text-[9px] text-white/20 font-medium italic">Haute résolution recommandée</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 px-4 overflow-hidden">
                                                <div className="h-px flex-1 bg-white/[0.05]" />
                                                <span className="text-[9px] font-black text-white/10 uppercase">OU</span>
                                                <div className="h-px flex-1 bg-white/[0.05]" />
                                            </div>

                                            <div className="relative group">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                                <input
                                                    value={formData.banner_url}
                                                    onChange={(e) => updateFormData("banner_url", e.target.value)}
                                                    placeholder="Lien URL de l'image"
                                                    className="w-full pl-12 pr-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-secondary/40 focus:bg-white/[0.04] transition-all font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Aperçu Master</label>
                                    <div className="aspect-[4/3] rounded-[2.5rem] bg-[#0C0C0E] border border-white/[0.05] relative overflow-hidden flex flex-col items-center justify-center p-8 group shadow-2xl">
                                        {(bannerPreview || formData.banner_url) ? (
                                            <img src={bannerPreview || formData.banner_url} className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none" alt="" />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-secondary/5" />
                                        )}

                                        {/* Overlay gradient for depth */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                                        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
                                            <div className="w-20 h-20 rounded-3xl bg-black/40 border border-white/10 flex items-center justify-center backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-transform group-hover:scale-110 duration-500">
                                                {(logoPreview || formData.logo_url) ? (
                                                    <img src={logoPreview || formData.logo_url} className="w-14 h-14 object-contain" alt="" />
                                                ) : (
                                                    <Zap className="w-8 h-8 text-white/10" />
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <p className="font-display text-2xl font-black text-white uppercase tracking-tight drop-shadow-2xl">
                                                    {formData.name || "VOTRE MARQUE"}
                                                </p>
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_10px_rgba(var(--secondary),0.5)]" />
                                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">
                                                        {categories.find(c => c.id === formData.category)?.label || "CATEGORIE"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] text-center">Système de prévisualisation AuraStore 2.0</p>
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-8 py-4 bg-white/5 text-white/40 font-black rounded-2xl text-[10px] uppercase tracking-[0.25em] hover:bg-white/10 hover:text-white transition-all"
                                >
                                    Retour
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="px-10 py-4 bg-white text-black font-black rounded-2xl text-[11px] uppercase tracking-[0.25em] hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-white/5 flex items-center gap-2 group"
                                >
                                    Confirmer l'Identité
                                    <Sparkles className="w-4 h-4 text-primary fill-current group-hover:scale-125 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="text-center space-y-10"
                        >
                            <div className="space-y-4">
                                <div className="w-24 h-24 mx-auto rounded-[2rem] bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-6 shadow-2xl shadow-primary/20 relative group">
                                    <Rocket className="w-full h-full text-white group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="font-display text-5xl font-black text-white tracking-tighter">PRÊT AU <span className="text-primary italic underline decoration-white/10 underline-offset-8">LANCEMENT.</span></h1>
                                    <p className="text-white/40 text-sm max-w-sm mx-auto font-bold uppercase tracking-widest">Initialisation des protocoles d'empire digital...</p>
                                </div>
                            </div>

                            <div className="glass-card rounded-[2.5rem] p-4 max-w-md mx-auto border border-white/[0.03] bg-white/[0.01]">
                                <div className="divide-y divide-white/5">
                                    <SummaryItem label="Concept" value={formData.name} />
                                    <SummaryItem label="WhatsApp" value={formData.whatsapp_number} />
                                    <SummaryItem label="Secteur" value={categories.find(c => c.id === formData.category)?.label || ""} />
                                    <SummaryItem label="Domaine" value={`${formData.slug}.aurastore.com`} />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md mx-auto">
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">{error}</p>
                                </div>
                            )}

                            <div className="flex flex-col items-center gap-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="w-[320px] py-5 bg-primary text-black font-black rounded-2xl text-xs uppercase tracking-[0.3em] hover:scale-[1.05] active:scale-95 transition-all shadow-[0_20px_50px_rgba(254,117,1,0.2)] flex items-center justify-center gap-3 group"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            DÉPLOYER L'EMPIRE
                                            <Zap className="w-4 h-4 fill-current group-hover:animate-pulse" />
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={isLoading}
                                    className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] hover:text-white/40 transition-colors"
                                >
                                    Modifier les visuels
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Technical Insight Footer */}
                <div className="pt-8 text-center opacity-30">
                    <p className="text-[8px] font-black text-white uppercase tracking-[0.8em] animate-pulse">AuraStore Protocol Engine v2.0 - Biometric Encrypted</p>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.01);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(254, 117, 1, 0.2);
                }
            `}</style>
        </div>
    );
}

function SummaryItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-center justify-between py-3 px-4">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{label}</span>
            <span className="text-[11px] font-black text-white uppercase tracking-tight">{value}</span>
        </div>
    );
}
