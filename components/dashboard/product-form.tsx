"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Package,
    DollarSign,
    Image as ImageIcon,
    Tag,
    Save,
    ChevronLeft,
    Loader2,
    Plus,
    X,
    Sparkles,
    Upload,
    Zap
} from "lucide-react";
import Link from "next/link";
import { createProduct, updateProduct, generateSlug } from "@/lib/actions/product";
import { uploadImage } from "@/lib/actions/storage";
import { Product } from "@/lib/supabase/types";

interface ProductFormProps {
    storeId: string;
    storeSlug: string;
    initialData?: Product | null;
}

export function ProductForm({ storeId, storeSlug, initialData }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState(initialData?.name || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [price, setPrice] = useState(initialData?.price?.toString() || "0.00");
    const [compareAtPrice, setCompareAtPrice] = useState(initialData?.compare_at_price?.toString() || "");
    const [category, setCategory] = useState(initialData?.category || "");
    const [stock, setStock] = useState(initialData?.stock?.toString() || "0");
    const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
    const [glbUrl, setGlbUrl] = useState(initialData?.glb_url || "");
    const [attributes, setAttributes] = useState<Record<string, any>>((initialData?.attributes as Record<string, any>) || {});

    // Preset Colors (~30)
    const PRESET_COLORS = [
        { name: "Midnight Black", hex: "#000000" },
        { name: "Pure White", hex: "#FFFFFF" },
        { name: "Slate Grey", hex: "#708090" },
        { name: "Volcanic Orange", hex: "#FE7501" },
        { name: "Deep Crimson", hex: "#B4160B" },
        { name: "Cyber Purple", hex: "#D400FF" },
        { name: "Emerald Green", hex: "#10B981" },
        { name: "Royal Blue", hex: "#4169E1" },
        { name: "Sunset Yellow", hex: "#FFE946" },
        { name: "Rose Pink", hex: "#FF69B4" },
        { name: "Charcoal", hex: "#36454F" },
        { name: "Navy Blue", hex: "#000080" },
        { name: "Olive Green", hex: "#808000" },
        { name: "Teal", hex: "#008080" },
        { name: "Maroon", hex: "#800000" },
        { name: "Turquoise", hex: "#40E0D0" },
        { name: "Indigo", hex: "#4B0082" },
        { name: "Violet", hex: "#EE82EE" },
        { name: "Gold", hex: "#FFD700" },
        { name: "Silver", hex: "#C0C0C0" },
        { name: "Bronze", hex: "#CD7F32" },
        { name: "Cream", hex: "#FFFDD0" },
        { name: "Beige", hex: "#F5F5DC" },
        { name: "Coral", hex: "#FF7F50" },
        { name: "Peach", hex: "#FFDAB9" },
        { name: "Mauve", hex: "#E0B0FF" },
        { name: "Forest Green", hex: "#228B22" },
        { name: "Ocean Blue", hex: "#0077BE" },
        { name: "Sand", hex: "#C2B280" },
        { name: "Ruby", hex: "#E0115F" },
    ];

    const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

    // Multi-image management
    const [images, setImages] = useState<string[]>(initialData?.images || []);
    const [uploadingFiles, setUploadingFiles] = useState<boolean[]>(new Array(3).fill(false));
    const [previews, setPreviews] = useState<(string | null)[]>(initialData?.images || new Array(3).fill(null));

    const isEditing = !!initialData;

    const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setName(val);
        if (!isEditing) {
            const newSlug = await generateSlug(val);
            setSlug(newSlug);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview immediately
        const previewUrl = URL.createObjectURL(file);
        const newPreviews = [...previews];
        newPreviews[index] = previewUrl;
        setPreviews(newPreviews);

        const newUploading = [...uploadingFiles];
        newUploading[index] = true;
        setUploadingFiles(newUploading);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const result = await uploadImage(formData, "store-assets");

            if (result.url) {
                const newImages = [...images];
                newImages[index] = result.url;
                setImages(newImages.filter(Boolean));
            } else if (result.error) {
                setError(`Upload error: ${result.error}`);
            }
        } catch (err) {
            setError("Image deployment failed.");
        } finally {
            const finalUploading = [...uploadingFiles];
            finalUploading[index] = false;
            setUploadingFiles(finalUploading);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previews];
        newPreviews.splice(index, 1);
        newPreviews.push(null); // Keep array length
        setPreviews(newPreviews);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = {
                name,
                slug,
                description,
                price: parseFloat(price),
                compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
                category,
                stock: parseInt(stock),
                is_active: isActive,
                glb_url: glbUrl || null,
                images: images.filter(Boolean),
                attributes,
            };

            if (isEditing) {
                const result = await updateProduct({
                    id: initialData.id,
                    ...data,
                });
                if (result.error) {
                    setError(typeof result.error === "string" ? result.error : "Échec de la mise à jour");
                } else {
                    router.push(`/dashboard/${storeSlug}/products`);
                    router.refresh();
                }
            } else {
                const result = await createProduct({
                    store_id: storeId,
                    ...data,
                });
                if (result.error) {
                    setError(typeof result.error === "string" ? result.error : "Échec de la création");
                } else {
                    router.push(`/dashboard/${storeSlug}/products`);
                    router.refresh();
                }
            }
        } catch (err) {
            setError("Une erreur est survenue lors du déploiement.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6 pb-20 scale-[0.98] transform-gpu">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/dashboard/${storeSlug}/products`}
                        className="p-1.5 bg-white/[0.03] border border-white/[0.05] rounded-xl text-white/40 hover:text-white transition-all group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    </Link>
                    <div className="space-y-0.5">
                        <p className="text-[9px] font-black tracking-[0.3em] text-primary uppercase">Console Produit</p>
                        <h1 className="font-display text-2xl font-black text-white leading-none">
                            {isEditing ? "Édition Master" : "Nouvel Asset"}
                        </h1>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-xl hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 fill-current" />
                    )}
                    {isEditing ? "Mettre à jour" : "Déployer"}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-wider text-center">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <section className="glass-card rounded-[2rem] p-8 border border-white/[0.03] space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -rotate-45 translate-x-12 -translate-y-12" />

                        <div className="flex items-center gap-3 text-primary">
                            <Package className="w-4 h-4" />
                            <h3 className="font-display font-black text-xs uppercase tracking-[0.2em] text-white">Informations de base</h3>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Nom du produit</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={handleNameChange}
                                    placeholder="Ex: Volcanic Hoodie v2"
                                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-3 px-4 focus:outline-none focus:border-primary/40 transition-all text-sm text-white font-bold"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Identifiant (Slug)</label>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className="w-full bg-white/[0.01] border border-white/[0.05] rounded-xl py-3 px-4 focus:outline-none focus:border-primary/40 transition-all text-sm text-white/50 font-bold"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Catégorie</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-3 px-4 focus:outline-none focus:border-primary/40 transition-all text-sm text-white font-bold appearance-none"
                                    >
                                        <option value="" className="bg-[#121216]">Standard</option>
                                        <option value="Clothing" className="bg-[#121216]">Vêtements</option>
                                        <option value="Accessories" className="bg-[#121216]">Accessoires</option>
                                        <option value="Digital" className="bg-[#121216]">Digital</option>
                                        <option value="Exclusive" className="bg-[#121216]">Exclusif</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Description narrative</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Racontez l'histoire de cet asset..."
                                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-3 px-4 focus:outline-none focus:border-primary/40 transition-all text-sm text-white font-medium resize-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Options & Attributs - Dynamic Intelligence */}
                    <section className="glass-card rounded-[2rem] p-8 border border-white/[0.03] space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-16 translate-x-16" />

                        <div className="flex items-center gap-3 text-primary">
                            <Zap className="w-4 h-4" />
                            <h3 className="font-display font-black text-xs uppercase tracking-[0.2em] text-white">Options & Spécifications</h3>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <>
                                {/* Color Selection - Premium Palette */}
                                {(category === "Clothing" || category === "Accessories") && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pl-1">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Couleurs Disponibles</label>
                                            <span className="text-[8px] font-black text-primary/40 uppercase tracking-widest">{attributes.colors?.length || 0} sélectionnées</span>
                                        </div>
                                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                                            {PRESET_COLORS.map((col) => {
                                                const isSelected = attributes.colors?.includes(col.hex);
                                                return (
                                                    <button
                                                        key={col.hex}
                                                        type="button"
                                                        onClick={() => {
                                                            const currentColors = attributes.colors || [];
                                                            const newColors = isSelected
                                                                ? currentColors.filter((c: string) => c !== col.hex)
                                                                : [...currentColors, col.hex];
                                                            setAttributes({ ...attributes, colors: newColors });
                                                        }}
                                                        className={`group relative w-8 h-8 rounded-full border-2 transition-all duration-300 ${isSelected ? 'border-primary' : 'border-transparent hover:border-white/20'}`}
                                                    >
                                                        <div
                                                            className="absolute inset-1 rounded-full shadow-inner"
                                                            style={{ backgroundColor: col.hex }}
                                                        />
                                                        {isSelected && (
                                                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-[#121216] shadow-lg" />
                                                        )}
                                                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 backdrop-blur-md text-[8px] text-white font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 border border-white/10">
                                                            {col.name}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Size Selector - Quick Toggles */}
                                {category === "Clothing" && (
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Tailles Disponibles</label>
                                        <div className="flex flex-wrap gap-2">
                                            {PRESET_SIZES.map((s) => {
                                                const isSelected = attributes.sizes?.includes(s);
                                                return (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onClick={() => {
                                                            const currentSizes = attributes.sizes || [];
                                                            const newSizes = isSelected
                                                                ? currentSizes.filter((sz: string) => sz !== s)
                                                                : [...currentSizes, s];
                                                            setAttributes({ ...attributes, sizes: newSizes });
                                                        }}
                                                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${isSelected
                                                            ? 'bg-primary border-primary text-black shadow-[0_0_15px_rgba(254,117,1,0.2)]'
                                                            : 'bg-white/[0.02] border-white/[0.05] text-white/40 hover:text-white hover:border-white/10'
                                                            }`}
                                                    >
                                                        {s}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Category-Specific Grid */}
                                {(category === "Clothing" || category === "Digital" || category === "Exclusive") && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/[0.03]">
                                        {category === "Clothing" && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Matériaux</label>
                                                <input
                                                    type="text"
                                                    value={attributes.material || ""}
                                                    onChange={(e) => setAttributes({ ...attributes, material: e.target.value })}
                                                    placeholder="ex: 100% Coton Bio"
                                                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-3 px-4 focus:outline-none focus:border-primary/40 transition-all text-sm text-white font-bold"
                                                />
                                            </div>
                                        )}

                                        {category === "Digital" && (
                                            <>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Format de fichier</label>
                                                    <input
                                                        type="text"
                                                        value={attributes.file_format || ""}
                                                        onChange={(e) => setAttributes({ ...attributes, file_format: e.target.value })}
                                                        placeholder="ex: ZIP (MP4 + Assets)"
                                                        className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-3 px-4 focus:outline-none focus:border-primary/40 transition-all text-sm text-white font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Type de Licence</label>
                                                    <input
                                                        type="text"
                                                        value={attributes.license || ""}
                                                        onChange={(e) => setAttributes({ ...attributes, license: e.target.value })}
                                                        placeholder="ex: Commerciale Standard"
                                                        className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-3 px-4 focus:outline-none focus:border-primary/40 transition-all text-sm text-white font-bold"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {category === "Exclusive" && (
                                            <>
                                                <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/[0.03] rounded-2xl">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Édition Limitée</p>
                                                        <p className="text-[8px] text-white/30 font-bold uppercase">Badge Exclusif Actif</p>
                                                    </div>
                                                    <div
                                                        className={`w-9 h-5 rounded-full relative cursor-pointer transition-all duration-500 ${attributes.limited_edition ? 'bg-primary shadow-[0_0_10px_rgba(254,117,1,0.3)]' : 'bg-white/10'}`}
                                                        onClick={() => setAttributes({ ...attributes, limited_edition: !attributes.limited_edition })}
                                                    >
                                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${attributes.limited_edition ? 'left-5' : 'left-1'}`} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Numéro de Série / Auth</label>
                                                    <input
                                                        type="text"
                                                        value={attributes.serial_number || ""}
                                                        onChange={(e) => setAttributes({ ...attributes, serial_number: e.target.value })}
                                                        placeholder="ex: AURA-2024-001"
                                                        className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-3 px-4 focus:outline-none focus:border-primary/40 transition-all text-sm text-white font-bold"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </>
                        </div>
                    </section>

                    {/* Pricing & Inventory */}
                    <section className="glass-card rounded-[2rem] p-8 border border-white/[0.03] space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <DollarSign className="w-4 h-4" />
                            <h3 className="font-display font-black text-xs uppercase tracking-[0.2em] text-white">Prix & Inventaire</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Prix de vente ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-3 px-4 focus:outline-none focus:border-primary/40 transition-all text-sm text-white font-black"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Prix original (Dénicher)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={compareAtPrice}
                                    onChange={(e) => setCompareAtPrice(e.target.value)}
                                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-3 px-4 focus:outline-none focus:border-primary/40 transition-all text-sm text-white/40 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Unités en stock</label>
                                <input
                                    type="number"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-3 px-4 focus:outline-none focus:border-primary/40 transition-all text-sm text-white font-black"
                                    required
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Details */}
                <div className="space-y-6">
                    {/* Media Gallery - Premium Edition */}
                    <section className="glass-card rounded-[2rem] p-6 border border-white/[0.03] space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-primary">
                                <ImageIcon className="w-4 h-4" />
                                <h3 className="font-display font-black text-xs uppercase tracking-[0.2em] text-white">Galerie Master</h3>
                            </div>
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{images.filter(Boolean).length}/3</span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {[0, 1, 2].map((idx) => (
                                <div key={idx} className="relative group">
                                    <div className={`aspect-video rounded-2xl border border-dashed transition-all duration-500 overflow-hidden flex flex-col items-center justify-center gap-2 
                                        ${previews[idx] ? 'border-primary/30 bg-primary/5' : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10'}`}>

                                        {previews[idx] ? (
                                            <>
                                                <img src={previews[idx]!} alt="" className={`w-full h-full object-cover transition-all duration-700 ${uploadingFiles[idx] ? 'opacity-30 blur-sm' : 'opacity-80 group-hover:opacity-100 group-hover:scale-105'}`} />
                                                {uploadingFiles[idx] ? (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">Déploiement...</span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:scale-110"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Upload className="w-5 h-5 text-white/20 group-hover:text-primary" />
                                                </div>
                                                <div className="text-center px-4">
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Asset #{idx + 1}</p>
                                                    <p className="text-[8px] text-white/10 font-bold mt-1">PNG, JPG ou WEBP</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleFileChange(e, idx)}
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 3D Experience - Automation */}
                    <section className="glass-card rounded-[2rem] p-6 border border-white/[0.03] space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 -rotate-45 translate-x-10 -translate-y-10" />
                        <div className="flex items-center gap-3 text-emerald-500">
                            <Sparkles className="w-4 h-4" />
                            <h3 className="font-display font-black text-xs uppercase tracking-[0.2em] text-white">Expérience 3D Aura</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Lien du modèle (.glb)</label>
                                <input
                                    type="url"
                                    value={glbUrl}
                                    onChange={(e) => setGlbUrl(e.target.value)}
                                    placeholder="https://assets.com/model.glb"
                                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500/40 transition-all text-[10px] text-white font-bold"
                                />
                                <p className="text-[8px] text-white/20 font-medium px-1">Optionnel. Si vide, Aura génèrera une plaque 3D automatique avec votre image.</p>
                            </div>
                        </div>
                    </section>

                    {/* Advanced Status */}
                    <section className="glass-card rounded-[2rem] p-6 border border-white/[0.03] space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

                        <div className="flex items-center gap-3 text-primary">
                            <Sparkles className="w-4 h-4" />
                            <h3 className="font-display font-black text-xs uppercase tracking-[0.2em] text-white">Statut Asset</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black text-white uppercase tracking-wider">Visibilité</p>
                                    <p className="text-[8px] text-white/30 font-bold uppercase">{isActive ? "Public" : "Brouillon"}</p>
                                </div>
                                <div
                                    className={`w-9 h-5 rounded-full relative cursor-pointer transition-all duration-500 ${isActive ? 'bg-primary shadow-[0_0_10px_rgba(254,117,1,0.3)]' : 'bg-white/10'}`}
                                    onClick={() => setIsActive(!isActive)}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${isActive ? 'left-5' : 'left-1'}`} />
                                </div>
                            </div>

                            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Optimisation IA Active</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </form>
    );
}
