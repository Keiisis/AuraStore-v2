"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    LayoutTemplate, Type, Eye, Save, Globe, Palette,
    Image as ImageIcon, Loader2, Sparkles, MonitorSmartphone
} from "lucide-react";
import { updateFrontendConfig, type FrontendConfig } from "@/lib/actions/frontend";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FrontendEditorProps {
    config: FrontendConfig;
}

export function FrontendEditor({ config }: FrontendEditorProps) {
    const router = useRouter();
    const [form, setForm] = useState(config);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("hero");

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await updateFrontendConfig(form);
            if (res.error) throw new Error(res.error);
            toast.success("Configuration mise à jour avec succès");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: "hero", label: "Hero Section", icon: Sparkles },
        { id: "sections", label: "Visibilité", icon: LayoutTemplate },
        { id: "brand", label: "Marque & SEO", icon: Globe },
        { id: "style", label: "Apparence", icon: Palette },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                        <MonitorSmartphone className="w-8 h-8 text-primary" />
                        FrontEnd Master
                    </h2>
                    <p className="text-[11px] text-white/30 font-bold uppercase tracking-[0.2em]">Personnalisation totale de la Landing Page</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Sauvegarder
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all border text-left group ${activeTab === tab.id
                                ? 'bg-white/[0.05] border-primary/30 text-white'
                                : 'bg-transparent border-transparent text-white/40 hover:bg-white/[0.02] hover:text-white'
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : 'text-white/20 group-hover:text-white/40'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 volcanic-glass p-8 min-h-[500px]">
                    {activeTab === "hero" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <h3 className="text-xl font-black text-white uppercase italic mb-6">Hero Configuration</h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                                        <Type className="w-3 h-3" /> Titre Principal
                                    </label>
                                    <textarea
                                        value={form.hero_title}
                                        onChange={e => setForm(f => ({ ...f, hero_title: e.target.value }))}
                                        className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white text-2xl font-black focus:outline-none focus:border-primary/50 transition-all min-h-[100px]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                                        <Type className="w-3 h-3" /> Sous-titre
                                    </label>
                                    <textarea
                                        value={form.hero_subtitle}
                                        onChange={e => setForm(f => ({ ...f, hero_subtitle: e.target.value }))}
                                        className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white/70 text-sm font-medium focus:outline-none focus:border-primary/50 transition-all min-h-[80px]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Bouton Primaire</label>
                                        <input
                                            value={form.hero_cta_primary}
                                            onChange={e => setForm(f => ({ ...f, hero_cta_primary: e.target.value }))}
                                            className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Bouton Secondaire</label>
                                        <input
                                            value={form.hero_cta_secondary}
                                            onChange={e => setForm(f => ({ ...f, hero_cta_secondary: e.target.value }))}
                                            className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "sections" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <h3 className="text-xl font-black text-white uppercase italic mb-6">Visibilité des Sections</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { key: "show_hero", label: "Hero Banner" },
                                    { key: "show_features", label: "Fonctionnalités" },
                                    { key: "show_themes", label: "Showcase Thèmes" },
                                    { key: "show_steps", label: "Comment ça marche" },
                                    { key: "show_pricing", label: "Grille Tarifaire" },
                                    { key: "show_footer", label: "Pied de page" },
                                    { key: "show_live_stats", label: "Statistiques Live" },
                                ].map(item => (
                                    <div key={item.key} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                        <span className="text-xs font-bold text-white/70 uppercase tracking-wider">{item.label}</span>
                                        <button
                                            onClick={() => setForm(f => ({ ...f, [item.key]: !(f as any)[item.key] }))}
                                            className={`w-12 h-6 rounded-full p-1 transition-all ${(form as any)[item.key] ? 'bg-primary' : 'bg-white/10'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${(form as any)[item.key] ? 'translate-x-6' : 'translate-x-0'
                                                }`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "brand" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <h3 className="text-xl font-black text-white uppercase italic mb-6">Marque & SEO</h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Nom de la Plateforme</label>
                                    <input
                                        value={form.brand_name}
                                        onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))}
                                        className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-primary/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Logo URL</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <input
                                                value={form.logo_url || ""}
                                                onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))}
                                                className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-primary/50 pr-24"
                                                placeholder="https://..."
                                            />
                                            <div className="absolute right-1 top-1 bottom-1">
                                                <input
                                                    type="file"
                                                    id="logo-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        const formData = new FormData();
                                                        formData.append("file", file);

                                                        const toastId = toast.loading("Upload en cours...");
                                                        try {
                                                            const res = await fetch("/api/upload", { method: "POST", body: formData });
                                                            const data = await res.json();
                                                            if (data.error) throw new Error(data.error);

                                                            setForm(f => ({ ...f, logo_url: data.url }));
                                                            toast.success("Logo uploadé !", { id: toastId });
                                                        } catch (err) {
                                                            toast.error("Erreur upload", { id: toastId });
                                                        }
                                                    }}
                                                />
                                                <label
                                                    htmlFor="logo-upload"
                                                    className="h-full px-3 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer text-[9px] font-bold text-white/60 hover:text-white uppercase tracking-wider transition-all"
                                                >
                                                    Upload
                                                </label>
                                            </div>
                                        </div>
                                        <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden">
                                            {form.logo_url ? (
                                                <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain" />
                                            ) : (
                                                <ImageIcon className="w-5 h-5 text-white/20" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center justify-between">
                                        <span>Gradient Logo (Si pas d'image)</span>
                                        <span className="text-[9px] text-white/20">Si URL est vide</span>
                                    </label>
                                    <div className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-4">
                                        <div className="flex gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-white/40 uppercase font-bold">Début</span>
                                                <input
                                                    type="color"
                                                    value={form.brand_color_start || form.primary_color}
                                                    onChange={e => setForm(f => ({ ...f, brand_color_start: e.target.value }))}
                                                    className="w-full h-8 rounded cursor-pointer bg-transparent border-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-white/40 uppercase font-bold">Fin</span>
                                                <input
                                                    type="color"
                                                    value={form.brand_color_end || "#ffffff"}
                                                    onChange={e => setForm(f => ({ ...f, brand_color_end: e.target.value }))}
                                                    className="w-full h-8 rounded cursor-pointer bg-transparent border-none"
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-end">
                                                <div className="h-10 flex items-center px-4 rounded border border-white/10 bg-[#050505]">
                                                    <span
                                                        className="font-black italic uppercase tracking-tighter text-lg"
                                                        style={{
                                                            backgroundImage: `linear-gradient(to right, ${form.brand_color_start || form.primary_color}, ${form.brand_color_end || "#ffffff"})`,
                                                            WebkitBackgroundClip: "text",
                                                            WebkitTextFillColor: "transparent"
                                                        }}
                                                    >
                                                        {form.brand_name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-white/5 pt-4 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">SEO Title</label>
                                        <input
                                            value={form.seo_title}
                                            onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))}
                                            className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Meta Description</label>
                                        <textarea
                                            value={form.seo_description}
                                            onChange={e => setForm(f => ({ ...f, seo_description: e.target.value }))}
                                            className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white/70 text-xs font-medium focus:outline-none focus:border-primary/50 min-h-[80px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "style" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <h3 className="text-xl font-black text-white uppercase italic mb-6">Apparence Globale</h3>
                            <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                <p className="text-xs text-yellow-200">
                                    🚧 <strong>Note Importante :</strong> La modification des couleurs affecte l'ensemble de la plateforme SaaS. Utilisez avec précaution.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Couleur Primaire (Hex)</label>
                                    <div className="flex gap-4 items-center">
                                        <input
                                            type="color"
                                            value={form.primary_color}
                                            onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))}
                                            className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer"
                                        />
                                        <input
                                            value={form.primary_color}
                                            onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))}
                                            className="w-32 px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white text-xs font-mono font-bold uppercase focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
