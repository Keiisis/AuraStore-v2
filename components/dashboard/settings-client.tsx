"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Store as StoreIcon, Globe, Palette, Shield, Trash2, Phone, Save, Loader2, Image, Cloud, Lock, CreditCard as CreditCardIcon, Upload, CheckCircle2, Sparkles } from "lucide-react";
import { updateStore, deleteStore } from "@/lib/actions/store";
import { uploadImage } from "@/lib/actions/storage";
import type { Store } from "@/lib/supabase/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PaymentSettings } from "./payment-settings";

interface SettingsClientProps {
    store: Store;
}

export function SettingsClient({ store }: SettingsClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"store" | "domain" | "design" | "security" | "payment" | "ai">("store");
    const [isSaving, setIsSaving] = useState(false);

    // File upload state
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(store.logo_url);
    const [bannerPreview, setBannerPreview] = useState<string | null>(store.banner_url);

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

    const handleSave = async (formData: FormData) => {
        setIsSaving(true);
        const loadingToast = toast.loading("Synchronisation avec la base de données...", {
            style: { background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }
        });

        try {
            let finalLogoUrl = formData.get("logo_url") as string || store.logo_url;
            let finalBannerUrl = formData.get("banner_url") as string || store.banner_url;

            // Upload logo if new file selected
            if (logoFile) {
                const logoFormData = new FormData();
                logoFormData.append("file", logoFile);
                const logoResult = await uploadImage(logoFormData);
                if (logoResult?.error) throw new Error(`Erreur upload logo: ${logoResult.error}`);
                if (logoResult?.url) finalLogoUrl = logoResult.url;
            }

            // Upload banner if new file selected
            if (bannerFile) {
                const bannerFormData = new FormData();
                bannerFormData.append("file", bannerFile);
                const bannerResult = await uploadImage(bannerFormData);
                if (bannerResult?.error) throw new Error(`Erreur upload bannière: ${bannerResult.error}`);
                if (bannerResult?.url) finalBannerUrl = bannerResult.url;
            }

            // Process payment config
            const paymentConfig: Record<string, string> = { ...(store.payment_config as any || {}) };
            Array.from(formData.keys()).forEach((key) => {
                if (key.startsWith("payment_config.")) {
                    const configKey = key.replace("payment_config.", "");
                    paymentConfig[configKey] = formData.get(key) as string;
                }
            });

            const updateData: any = { id: store.id };

            // Intelligence: Only append if changed & trim inputs
            const name = (formData.get("name") as string || "").trim();
            const description = (formData.get("description") as string || "").trim();
            const whatsapp_number = (formData.get("whatsapp_number") as string || "").trim();
            const custom_domain = (formData.get("custom_domain") as string || "").trim();

            if (name && name !== store.name) updateData.name = name;
            if (description !== store.description) updateData.description = description;
            if (whatsapp_number !== store.whatsapp_number) updateData.whatsapp_number = whatsapp_number;
            if (custom_domain !== store.custom_domain) updateData.custom_domain = custom_domain || null;
            if (finalLogoUrl !== store.logo_url) updateData.logo_url = finalLogoUrl;
            if (finalBannerUrl !== store.banner_url) updateData.banner_url = finalBannerUrl;

            // Only update payment_config if it has keys or if it's different from current
            if (Object.keys(paymentConfig).length > 0) {
                updateData.payment_config = paymentConfig;
            }

            console.log("Final payload to server action:", JSON.stringify(updateData, null, 2));
            const result = await updateStore(updateData);
            console.log("Action Result:", result);

            if (result.error) {
                let errorDesc = "Une erreur est survenue.";
                if (typeof result.error === 'string') errorDesc = result.error;
                else if (typeof result.error === 'object') {
                    errorDesc = Object.entries(result.error)
                        .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
                        .join(" | ");
                }

                toast.error("Échec de la mise à jour", {
                    id: loadingToast,
                    description: errorDesc,
                });
            } else {
                toast.success("Empire mis à jour", {
                    id: loadingToast,
                    description: "Toutes les modifications ont été fusionnées avec succès.",
                    icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
                });

                // Finalize previews
                if (finalLogoUrl !== store.logo_url) setLogoPreview(finalLogoUrl);
                if (finalBannerUrl !== store.banner_url) setBannerPreview(finalBannerUrl);

                // Clear files after success
                setLogoFile(null);
                setBannerFile(null);

                // Refresh data to show updates
                router.refresh();
            }
        } catch (err: any) {
            console.error("Critical error in handleSave:", err);
            toast.error("Erreur Système", {
                id: loadingToast,
                description: err.message || "Le hangar a rencontré un problème technique.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette boutique ? Cette action est irréversible.")) {
            // Call server action for deletion
            await deleteStore(store.id);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Navigation Latérale Interne */}
            <div className="space-y-1">
                <SettingsNavItem
                    icon={<StoreIcon className="w-4 h-4" />}
                    label="Boutique"
                    active={activeTab === "store"}
                    onClick={() => setActiveTab("store")}
                />
                <SettingsNavItem
                    icon={<Globe className="w-4 h-4" />}
                    label="Domaine & URL"
                    active={activeTab === "domain"}
                    onClick={() => setActiveTab("domain")}
                />
                <SettingsNavItem
                    icon={<Palette className="w-4 h-4" />}
                    label="Design & Logo"
                    active={activeTab === "design"}
                    onClick={() => setActiveTab("design")}
                />
                <SettingsNavItem
                    icon={<CreditCardIcon className="w-4 h-4" />}
                    label="Paiements"
                    active={activeTab === "payment"}
                    onClick={() => setActiveTab("payment")}
                />
                <SettingsNavItem
                    icon={<Cloud className="w-4 h-4" />}
                    label="Intelligence Artificielle"
                    active={activeTab === "ai"}
                    onClick={() => setActiveTab("ai")}
                />
                <SettingsNavItem
                    icon={<Shield className="w-4 h-4" />}
                    label="Sécurité"
                    active={activeTab === "security"}
                    onClick={() => setActiveTab("security")}
                />
            </div>

            <div className="lg:col-span-2 space-y-6">
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        console.log("Submit triggered");
                        const formData = new FormData(e.currentTarget);
                        await handleSave(formData);
                    }}
                    className="glass-card rounded-[2rem] border border-white/[0.03] p-8 space-y-8"
                >
                    {/* Sections hidden/visible depending on activeTab */}
                    {/* ... (keep existing sections) ... */}
                    <div className={activeTab === "store" ? "space-y-8" : "hidden"}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Nom de la boutique</label>
                                <input
                                    name="name"
                                    type="text"
                                    defaultValue={store.name}
                                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-sm text-white focus:outline-none focus:border-primary/40 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Identifiant (Slug)</label>
                                <input
                                    type="text"
                                    defaultValue={store.slug}
                                    disabled
                                    className="w-full px-4 py-3 bg-white/[0.01] border border-white/[0.03] rounded-xl text-sm text-white/30 cursor-not-allowed font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Numéro WhatsApp</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <input
                                    name="whatsapp_number"
                                    type="text"
                                    defaultValue={store.whatsapp_number || ""}
                                    placeholder="ex: +2250707070707"
                                    className="w-full pl-10 pr-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-sm text-white focus:outline-none focus:border-primary/40 transition-all font-medium placeholder:text-white/10"
                                />
                            </div>
                            <p className="text-[10px] text-white/30 pl-1">Indispensable pour recevoir vos commandes via WhatsApp.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Description</label>
                            <textarea
                                name="description"
                                rows={3}
                                defaultValue={store.description || ""}
                                placeholder="Décrivez votre boutique en quelques mots..."
                                className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-sm text-white focus:outline-none focus:border-primary/40 transition-all font-medium resize-none"
                            />
                        </div>
                    </div>

                    <div className={activeTab === "domain" ? "space-y-6" : "hidden"}>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Domaine Personnalisé</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <input
                                    name="custom_domain"
                                    type="text"
                                    defaultValue={store.custom_domain || ""}
                                    placeholder="ex: maboutique.com"
                                    className="w-full pl-10 pr-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-sm text-white focus:outline-none focus:border-primary/40 transition-all font-medium placeholder:text-white/10"
                                />
                            </div>
                            <p className="text-[10px] text-white/30 pl-1">Configurez un DNS CNAME pointant vers <code>cname.aurastore.com</code>.</p>
                        </div>
                    </div>

                    <div className={activeTab === "design" ? "space-y-8" : "hidden"}>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Identité Visuelle (Logo)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                <div className="relative group overflow-hidden bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:bg-white/[0.04] transition-all">
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                                    <div className="flex flex-col items-center justify-center p-8 gap-4 text-center">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Upload className="w-5 h-5 text-white/40" />
                                        </div>
                                        <p className="text-xs font-bold text-white mb-1">Dernière étape du style</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 p-4 bg-white/[0.01] rounded-2xl border border-white/[0.03]">
                                    <div className="w-20 h-20 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                                        {logoPreview ? <img src={logoPreview} alt="" className="w-full h-full object-contain" /> : <StoreIcon className="w-8 h-8 text-white/10" />}
                                    </div>
                                    <input type="hidden" name="logo_url" value={logoPreview || ""} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Bannière</label>
                            <div className="w-full aspect-[3/1] bg-black/40 rounded-2xl border border-white/10 overflow-hidden relative group">
                                {bannerPreview ? <img src={bannerPreview} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" /> : <div className="w-full h-full flex items-center justify-center"><Image className="w-10 h-10 text-white/10" /></div>}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="relative">
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                                        <button type="button" className="px-6 py-3 bg-white text-black text-xs font-bold uppercase rounded-xl">Changer</button>
                                    </div>
                                </div>
                                <input type="hidden" name="banner_url" value={bannerPreview || ""} />
                            </div>
                        </div>
                    </div>

                    <div className={activeTab === "payment" ? "block" : "hidden"}>
                        <PaymentSettings store={store} />
                    </div>

                    <div className={activeTab === "ai" ? "space-y-8" : "hidden"}>
                        <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-white text-sm font-black uppercase tracking-tight">Moteur de VTO & Innovation</h4>
                                <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                                    Configurez vos connecteurs IA pour activer l'essayage virtuel et la 3D intelligente.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Clé API FAL AI (FAL_KEY)</label>
                                    <a href="https://fal.ai/dashboard/keys" target="_blank" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Obtenir une clé</a>
                                </div>
                                <div className="relative">
                                    <Cloud className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <input
                                        name="payment_config.FAL_KEY"
                                        type="password"
                                        defaultValue={(store.payment_config as any)?.FAL_KEY || ""}
                                        placeholder="votre_cle_api_ici"
                                        className="w-full pl-10 pr-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-sm text-white focus:outline-none focus:border-primary/40 transition-all font-medium placeholder:text-white/10"
                                    />
                                </div>
                                <p className="text-[10px] text-white/30 pl-1">Cette clé permet à l'IA d'Aura Lab de générer les images d'essayage pour vos clients.</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Clé API REPLICATE (REPLICATE_API_TOKEN)</label>
                                    <a href="https://replicate.com/account/api-tokens" target="_blank" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Obtenir une clé</a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <input
                                        name="payment_config.REPLICATE_API_TOKEN"
                                        type="password"
                                        defaultValue={(store.payment_config as any)?.REPLICATE_API_TOKEN || ""}
                                        placeholder="r8_..."
                                        className="w-full pl-10 pr-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-sm text-white focus:outline-none focus:border-primary/40 transition-all font-medium placeholder:text-white/10"
                                    />
                                </div>
                                <p className="text-[10px] text-white/30 pl-1">Alternative puissante pour le rendu 3D et le VTO haute fidélité.</p>
                            </div>

                            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                <p className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest leading-relaxed">
                                    <span className="font-black">Attention :</span> Conservez vos clés API secrètes. Elles sont chiffrées lors du stockage mais ne doivent jamais être partagées.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={activeTab === "security" ? "space-y-6" : "hidden"}>
                        <div className="p-6 bg-green-500/5 rounded-[2rem] border border-green-500/10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center"><Lock className="w-6 h-6 text-green-500" /></div>
                            <div className="space-y-1">
                                <h4 className="text-white text-sm font-black uppercase">Connexion Blindée</h4>
                                <p className="text-white/40 text-xs">Protégé par SSL.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end">
                        <motion.button
                            type="submit"
                            disabled={isSaving}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative overflow-hidden px-12 py-5 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-[1.5rem] shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                    <span>Synchronisation...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 transition-transform group-hover:scale-125" />
                                    <span>Mettre à jour l'Empire</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>

                {/* Zone de Danger */}
                {activeTab === "security" && (
                    <div className="glass-card rounded-[2rem] border border-red-500/10 p-8 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div>
                            <h3 className="text-red-500 font-bold text-lg uppercase tracking-wider">Zone de Danger</h3>
                            <p className="text-white/30 text-xs font-medium">Ces actions sont irréversibles et supprimeront définitivement votre Aura.</p>
                        </div>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-6 py-3 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-xl border border-red-500/10 transition-all text-[11px] font-black uppercase tracking-widest group"
                        >
                            <Trash2 className="w-4 h-4 group-hover:animate-bounce" />
                            Supprimer l'Aura
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function SettingsNavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? "bg-white/[0.05] text-white" : "text-white/30 hover:bg-white/[0.02] hover:text-white/60"}`}
        >
            {icon}
            <span className="text-xs font-bold uppercase tracking-tight">{label}</span>
        </button>
    );
}
