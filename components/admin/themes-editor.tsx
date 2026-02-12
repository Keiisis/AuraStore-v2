"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, Loader2, Upload, Palette, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Theme {
    id: string;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    colors: string[];
    is_active: boolean;
    display_order: number;
}

export function ThemesEditor() {
    const router = useRouter();
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Theme>>({});
    const [uploading, setUploading] = useState(false);

    const fetchThemes = async () => {
        try {
            const res = await fetch("/api/themes");
            const data = await res.json();
            setThemes(data.themes || []);
        } catch (err) {
            toast.error("Erreur lors de la récupération des thèmes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThemes();
    }, []);

    const handleSave = async () => {
        if (!formData.name || !formData.slug) {
            toast.error("Le nom et le slug sont requis");
            return;
        }

        try {
            const method = (!editingId || editingId.startsWith('new-')) ? "POST" : "PUT";
            const body = method === "POST" ? formData : { ...formData, id: editingId };

            const res = await fetch("/api/themes", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Erreur lors de la sauvegarde");
                return;
            }

            toast.success("Design System mis à jour");
            setEditingId(null);
            setFormData({});
            fetchThemes();
            router.refresh();
        } catch (err) {
            toast.error("Erreur réseau");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer définitivement cette identité visuelle ?")) return;

        try {
            const res = await fetch(`/api/themes?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Identité supprimée");
                fetchThemes();
            } else {
                const data = await res.json();
                toast.error(data.error || "Erreur lors de la suppression");
            }
        } catch (err) {
            toast.error("Erreur réseau");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: uploadData,
            });
            const data = await res.json();
            if (data.url) {
                setFormData(prev => ({ ...prev, image_url: data.url }));
                toast.success("Image uploadée avec succès");
            }
        } catch (err) {
            toast.error("Échec de l'upload");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-24">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
        </div>
    );

    return (
        <div className="space-y-12">
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Sidebar List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Bibliothèque d'Identités</h3>
                        <div className="flex items-center gap-3">
                            {themes.length < 10 && (
                                <button
                                    onClick={async () => {
                                        const presets = [
                                            { name: 'Volcanic Luxe (Streetwear)', slug: 'streetwear', description: 'Identité sombre et brute, contrastes néons pour streetwear.', colors: ['#0A0A0A', '#FE7501', '#FFFFFF'], display_order: 1 },
                                            { name: 'Emerald Night (Traditionnel)', slug: 'traditionnel', description: "Émeraudes et dorures valorisant l'héritage traditionnel.", colors: ['#064e3b', '#00FF88', '#fef3c7'], display_order: 2 },
                                            { name: 'Cyber Orchid (Cosmétiques)', slug: 'cosmetiques', description: 'Futuriste, vibrant, pour les produits digitaux et cosmétiques.', colors: ['#2e1065', '#00D1FF', '#00ffff'], display_order: 3 },
                                            { name: 'Sneakers Hub', slug: 'sneakers', description: 'Vibrant, énergique, typographie audacieuse pour collectionneurs.', colors: ['#000000', '#FF00FF', '#ffffff'], display_order: 4 },
                                            { name: 'Techwear Future', slug: 'techwear', description: 'Cyberpunk, noir profond et bleus électriques pour la tech.', colors: ['#050505', '#6A00FF', '#180C2E'], display_order: 5 },
                                            { name: 'Bijoux & Or', slug: 'bijoux', description: 'Minimalisme épuré, teintes crème et reflets métalliques.', colors: ['#fafaf9', '#FFE946', '#1c1917'], display_order: 6 },
                                            { name: 'Sacs & Étuis', slug: 'sacs', description: 'Cuirs profonds, ambiances terreuses et élégance intemporelle.', colors: ['#1c1917', '#FBBF24', '#fef3c7'], display_order: 7 },
                                            { name: 'Accessoires Mode', slug: 'accessoires', description: 'Palette équilibrée et moderne pour petits objets de luxe.', colors: ['#0c0a09', '#10B981', '#fafaf9'], display_order: 8 },
                                            { name: 'Y2K Style', slug: 'y2k', description: 'Acid colors, chrome et esthétique futuriste des années 2000.', colors: ['#2e1065', '#FF3E00', '#00ffff'], display_order: 9 },
                                            { name: 'Minimalist Couture', slug: 'minimalist', description: 'Noir et blanc absolu, focalisation sur le produit.', colors: ['#ffffff', '#000000', '#71717a'], display_order: 10 }
                                        ];

                                        toast.promise(Promise.all(presets.map(p =>
                                            fetch("/api/themes", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ ...p, is_active: true })
                                            })
                                        )), {
                                            loading: 'Injection des 10 Identités S-Rank...',
                                            success: () => { fetchThemes(); return 'Système Synchronisé (10/10)'; },
                                            error: 'Échec de l\'injection'
                                        });
                                    }}
                                    className="text-[8px] font-black uppercase text-primary border border-primary/20 bg-primary/5 px-2 py-1 rounded hover:bg-primary hover:text-black transition-all"
                                >
                                    Sync Master
                                </button>
                            )}
                            <span className="text-[10px] font-mono text-primary">{themes.length}/10</span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setEditingId(`new-${Date.now()}`);
                            setFormData({
                                name: "",
                                slug: "",
                                description: "",
                                image_url: "",
                                colors: ["#0A0A0B", "#FE7501", "#FFFFFF"],
                                is_active: true,
                                display_order: themes.length + 1
                            });
                        }}
                        className="w-full py-6 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[2rem] text-white/30 hover:text-white hover:border-primary/40 hover:bg-white/[0.04] transition-all flex flex-col items-center gap-2 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest">Injecter une Identité</span>
                    </button>

                    <div className="space-y-3">
                        {themes.map((theme) => (
                            <motion.div
                                key={theme.id}
                                layoutId={theme.id}
                                onClick={() => { setEditingId(theme.id); setFormData(theme); }}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${editingId === theme.id ? "bg-primary/10 border-primary shadow-lg shadow-primary/5" : "bg-[#0A0A0C] border-white/5 hover:border-white/10"
                                    }`}
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden relative border border-white/10">
                                            <Image src={theme.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe'} fill className="object-cover" alt="" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-white uppercase italic tracking-tighter">{theme.name}</h4>
                                            <p className="text-[8px] text-white/30 font-bold uppercase tracking-wider">{theme.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex -space-x-1">
                                        {theme.colors.slice(0, 3).map((c, i) => (
                                            <div key={i} className="w-2.5 h-2.5 rounded-full border border-black/50 shadow-sm" style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Content Editor */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {editingId ? (
                            <motion.div
                                key="editor"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-[#0A0A0C] border border-white/5 rounded-[2.5rem] p-10 sticky top-24"
                            >
                                <div className="grid lg:grid-cols-2 gap-16">
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <Palette className="w-5 h-5 text-primary" />
                                                <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Configuration Design</h3>
                                            </div>
                                            <button onClick={() => setEditingId(null)} className="p-2 rounded-full hover:bg-white/5 transition-colors">
                                                <X className="w-4 h-4 text-white/40" />
                                            </button>
                                        </div>

                                        <div className="space-y-5">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input label="Nom Public" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
                                                <Input label="Slug Système" value={formData.slug} onChange={v => setFormData({ ...formData, slug: v })} />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Description Marketing</label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white text-xs h-24 outline-none focus:border-primary/40 transition-all resize-none font-medium"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Palette Chromatique</label>
                                                <div className="flex flex-wrap gap-3 p-4 bg-black/40 rounded-2xl border border-white/5">
                                                    {(formData.colors || []).map((color, i) => (
                                                        <div key={i} className="group relative">
                                                            <input
                                                                type="color"
                                                                value={color}
                                                                onChange={e => {
                                                                    const newColors = [...(formData.colors || [])];
                                                                    newColors[i] = e.target.value;
                                                                    setFormData({ ...formData, colors: newColors });
                                                                }}
                                                                className="w-10 h-10 rounded-xl border-none cursor-pointer bg-transparent"
                                                            />
                                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white text-black p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <X className="w-full h-full cursor-pointer" onClick={() => {
                                                                    const filtered = (formData.colors || []).filter((_, idx) => idx !== i);
                                                                    setFormData({ ...formData, colors: filtered });
                                                                }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => setFormData({ ...formData, colors: [...(formData.colors || []), "#ffffff"] })}
                                                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/30 hover:text-white hover:border-primary/50 transition-all"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Visuel Principal</label>
                                                <div className="flex items-center gap-6">
                                                    <div className="w-24 h-24 bg-black rounded-2xl relative overflow-hidden border border-white/5 shadow-2xl">
                                                        {formData.image_url ? (
                                                            <Image src={formData.image_url} fill alt="" className="object-cover" />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-white/10"><ImageIcon className="w-8 h-8" /></div>
                                                        )}
                                                    </div>
                                                    <label className="flex-1 h-24 flex flex-col items-center justify-center bg-white/[0.02] border border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-primary/40 transition-all group">
                                                        {uploading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : (
                                                            <>
                                                                <Upload className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors mb-2" />
                                                                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Mettre à jour l'image</span>
                                                            </>
                                                        )}
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="pt-6 flex gap-4">
                                                <button onClick={handleSave} className="flex-1 py-4 bg-primary text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20">
                                                    Déployer l'Identité
                                                </button>
                                                {(!editingId.startsWith('new-')) && (
                                                    <button onClick={() => handleDelete(editingId!)} className="px-5 py-4 bg-red-500/10 text-red-500 border border-red-500/10 rounded-2xl hover:bg-red-500/20 transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Mock */}
                                    <div className="hidden lg:block space-y-6">
                                        <div className="flex items-center gap-2 px-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Simulateur Retail S-Rank</span>
                                        </div>
                                        <div className="border border-white/5 rounded-[3rem] h-[600px] bg-[#020203] overflow-hidden flex flex-col shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative group/mock">
                                            <div className="h-12 px-8 flex items-center justify-between border-b border-white/5 bg-black/40">
                                                <div className="w-4 h-4 rounded-full border-2 border-white/10 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: formData.colors?.[1] || '#FE7501' }} />
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="w-8 h-1 bg-white/5 rounded-full" />
                                                    <div className="w-8 h-1 bg-white/5 rounded-full" />
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-hidden p-8 space-y-8">
                                                <div className="relative h-44 rounded-[2rem] overflow-hidden border border-white/5 group-hover/mock:scale-[1.02] transition-transform duration-700">
                                                    {formData.image_url && <Image src={formData.image_url} fill className="object-cover opacity-60 grayscale-[0.3]" alt="" />}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                                    <div className="absolute bottom-6 left-6">
                                                        <div className="h-6 w-32 rounded-full blur-[2px] opacity-50" style={{ backgroundColor: formData.colors?.[1] || '#FE7501' }} />
                                                        <div className="h-6 w-32 rounded-full absolute top-0" style={{ backgroundColor: `${formData.colors?.[1] || '#FE7501'}aa` }} />
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="h-2 w-24 bg-white/10 rounded-full" />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {[1, 2].map(i => (
                                                            <div key={i} className="aspect-[4/5] rounded-[2rem] bg-white/[0.02] border border-white/5 p-4 flex flex-col justify-end gap-3">
                                                                <div className="h-2 w-full bg-white/5 rounded-full" />
                                                                <div className="h-3 w-2/3 rounded-full" style={{ backgroundColor: formData.colors?.[1] || '#FE7501' }} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="absolute bottom-10 left-10 right-10">
                                                <div className="w-full py-5 rounded-2xl flex items-center justify-center text-[9px] font-black uppercase tracking-[0.3em] text-black shadow-2xl" style={{ backgroundColor: formData.colors?.[1] || '#FE7501' }}>
                                                    Commander l'Élite
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-[750px] flex flex-col items-center justify-center text-white/5 border-2 border-dashed border-white/5 rounded-[3rem]">
                                <Palette className="w-16 h-16 mb-4" />
                                <p className="text-[10px] uppercase tracking-[0.4em] font-black">Design Core Engine</p>
                                <p className="text-[10px] font-medium max-w-[250px] text-center mt-2 italic">Sélectionnez une identité pour modifier son ADN visuel</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

const Input = ({ label, value, onChange }: { label: string, value?: string, onChange: (v: string) => void }) => (
    <div className="space-y-2">
        <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{label}</label>
        <input
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-white text-xs focus:border-primary/40 outline-none transition-all font-medium"
        />
    </div>
);
