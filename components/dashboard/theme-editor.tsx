"use client";

import { useState, useEffect } from "react";
import {
    Palette,
    Layout,
    Type,
    Smartphone,
    Monitor,
    Save,
    Plus,
    RotateCcw,
    Type as FontIcon,
    Box,
    Settings,
    Check,
    Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { ThemeConfig, VIBE_PRESETS, ThemeTokens } from "@/lib/theme-engine/types";
import { ThemeProvider, useTheme } from "@/lib/theme-engine/context";
import { CurrencyProvider } from "@/lib/theme-engine/currency-context";
import { LayoutRenderer } from "@/lib/theme-engine/renderer";
import { registerAllBlocks } from "@/components/blocks";
import { updateStore } from "@/lib/actions/store";

// Ensure blocks are registered immediately
registerAllBlocks();

import type { Product } from "@/lib/supabase/types";

interface ThemeEditorProps {
    storeId: string;
    storeSlug: string;
    initialTheme: ThemeConfig;
    products?: Product[];
}

import { Trash2, ArrowUp, ArrowDown, ChevronLeft, X } from "lucide-react";
import type { BlockType } from "@/lib/theme-engine/types";

function EditorPanel({ isSaving, handleSave }: { isSaving: boolean, handleSave: () => Promise<void> }) {
    const { theme, updateTokens, tokens, addBlock, removeBlock, updateBlock, reorderBlocks } = useTheme();
    const [activeTab, setActiveTab] = useState<"vibes" | "tokens" | "layout">("vibes");
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
    const [showAddMenu, setShowAddMenu] = useState(false);

    const handleAddBlock = (type: BlockType) => {
        const id = `${type}-${Date.now()}`;
        const newBlock = {
            id,
            type,
            props: getDefaultProps(type),
        };
        addBlock(newBlock);
        setShowAddMenu(false);
    };

    const getDefaultProps = (type: BlockType) => {
        switch (type) {
            case "hero_v1":
                return {
                    title: "Nouvelle Collection",
                    subtitle: "Découvrez nos derniers articles",
                    ctaText: "Acheter",
                    ctaLink: "/products",
                };
            case "product_grid":
                return {
                    title: "Nos Produits",
                    limit: 4,
                    columns: 4,
                };
            case "marquee":
                return {
                    text: "LIVRAISON GRATUITE • NOUVEAUTÉS • ",
                    speed: 30,
                };
            default:
                return {};
        }
    };

    const renderBlockEditor = () => {
        const block = theme.layout_home.find((b) => b.id === editingBlockId);
        if (!block) return null;

        return (
            <div className="space-y-6">
                <header className="flex items-center gap-2 pb-4 border-b border-white/5">
                    <button
                        onClick={() => setEditingBlockId(null)}
                        className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h3 className="font-display font-bold text-lg">Edit {block.type.replace("_", " ")}</h3>
                        <p className="text-xs text-white/40 font-mono">{block.id}</p>
                    </div>
                </header>

                <div className="space-y-4">
                    {block.type === "hero_v1" && (
                        <>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-white/60">Titre</label>
                                <input
                                    type="text"
                                    value={block.props.title as string || ""}
                                    onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-white/60">Sous-titre</label>
                                <textarea
                                    value={block.props.subtitle as string || ""}
                                    onChange={(e) => updateBlock(block.id, { subtitle: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    rows={2}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-white/60">Bouton Texte</label>
                                    <input
                                        type="text"
                                        value={block.props.ctaText as string || ""}
                                        onChange={(e) => updateBlock(block.id, { ctaText: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-white/60">Lien Bouton</label>
                                    <input
                                        type="text"
                                        value={block.props.ctaLink as string || ""}
                                        onChange={(e) => updateBlock(block.id, { ctaLink: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {block.type === "product_grid" && (
                        <>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-white/60">Titre Section</label>
                                <input
                                    type="text"
                                    value={block.props.title as string || ""}
                                    onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-white/60">Limite produits</label>
                                <input
                                    type="number"
                                    value={block.props.limit as number || 4}
                                    onChange={(e) => updateBlock(block.id, { limit: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm"
                                />
                            </div>
                        </>
                    )}

                    {block.type === "marquee" && (
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-white/60">Texte (séparé par •)</label>
                            <textarea
                                value={block.props.text as string || ""}
                                onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                rows={3}
                            />
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-white/5">
                    <button
                        onClick={() => {
                            if (confirm("Supprimer ce bloc ?")) {
                                removeBlock(block.id);
                                setEditingBlockId(null);
                            }
                        }}
                        className="w-full py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Supprimer le bloc
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-surface border-r border-white/5">
            {/* Tabs (Hidden in edit mode) */}
            {!editingBlockId && (
                <div className="flex border-b border-white/5 bg-white/[0.02]">
                    <TabButton
                        active={activeTab === "vibes"}
                        onClick={() => setActiveTab("vibes")}
                        icon={<Palette className="w-4 h-4" />}
                        label="Vibes"
                    />
                    <TabButton
                        active={activeTab === "tokens"}
                        onClick={() => setActiveTab("tokens")}
                        icon={<Type className="w-4 h-4" />}
                        label="Tokens"
                    />
                    <TabButton
                        active={activeTab === "layout"}
                        onClick={() => setActiveTab("layout")}
                        icon={<Layout className="w-4 h-4" />}
                        label="Layout"
                    />
                </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                {editingBlockId ? (
                    renderBlockEditor()
                ) : (
                    <>
                        {activeTab === "vibes" && (
                            <div className="space-y-6">
                                <header className="space-y-1">
                                    <h3 className="font-display font-bold text-lg">Choose your Vibe</h3>
                                    <p className="text-sm text-white/40">Select a preset to get started</p>
                                </header>

                                <div className="grid grid-cols-1 gap-4">
                                    {VIBE_PRESETS.map((preset) => {
                                        const isSelected = preset.tokens.primary === tokens.primary;
                                        return (
                                            <button
                                                key={preset.id}
                                                onClick={() => updateTokens(preset.tokens)}
                                                className={`group relative p-4 rounded-2xl text-left border transition-all ${isSelected ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(254,117,1,0.1)]" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-sm tracking-wide">{preset.name}</span>
                                                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                                                </div>
                                                <p className="text-xs text-white/40 line-clamp-1">{preset.description}</p>

                                                <div className="mt-3 flex gap-1.5">
                                                    {Object.entries(preset.tokens).filter(([k]) => ['primary', 'secondary', 'accent', 'background'].includes(k)).map(([k, v]) => (
                                                        <div
                                                            key={k}
                                                            className="w-4 h-4 rounded-full border border-black/20"
                                                            style={{ backgroundColor: v }}
                                                        />
                                                    ))}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeTab === "tokens" && (
                            <div className="space-y-8">
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-white/40 mb-2">
                                        <Palette className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Colors</span>
                                    </div>

                                    <div className="space-y-4">
                                        <ColorInput label="Primary" value={tokens.primary} onChange={(v) => updateTokens({ primary: v })} />
                                        <ColorInput label="Secondary" value={tokens.secondary} onChange={(v) => updateTokens({ secondary: v })} />
                                        <ColorInput label="Background" value={tokens.background} onChange={(v) => updateTokens({ background: v })} />
                                        <ColorInput label="Surface" value={tokens.surface} onChange={(v) => updateTokens({ surface: v })} />
                                        <ColorInput label="Text" value={tokens.text} onChange={(v) => updateTokens({ text: v })} />
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-white/40 mb-2">
                                        <FontIcon className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Typography</span>
                                    </div>

                                    <div className="space-y-4">
                                        <section className="space-y-2">
                                            <label className="text-xs font-medium text-white/60">Heading Font</label>
                                            <select
                                                value={tokens.fontDisplay}
                                                onChange={(e) => updateTokens({ fontDisplay: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="Sora">Sora</option>
                                                <option value="Inter">Inter</option>
                                                <option value="Outfit">Outfit</option>
                                                <option value="Space Grotesk">Space Grotesk</option>
                                            </select>
                                        </section>
                                        <section className="space-y-2">
                                            <label className="text-xs font-medium text-white/60">Body Font</label>
                                            <select
                                                value={tokens.fontBody}
                                                onChange={(e) => updateTokens({ fontBody: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="DM Sans">DM Sans</option>
                                                <option value="Inter">Inter</option>
                                                <option value="Roboto">Roboto</option>
                                            </select>
                                        </section>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-white/40 mb-2">
                                        <Box className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Rounding</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <section className="space-y-2">
                                            <label className="text-xs font-medium text-white/60">Base Radius</label>
                                            <input
                                                type="text"
                                                value={tokens.radius}
                                                onChange={(e) => updateTokens({ radius: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm"
                                            />
                                        </section>
                                        <section className="space-y-2">
                                            <label className="text-xs font-medium text-white/60">Large Radius</label>
                                            <input
                                                type="text"
                                                value={tokens.radiusLg}
                                                onChange={(e) => updateTokens({ radiusLg: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm"
                                            />
                                        </section>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === "layout" && (
                            <div className="space-y-6">
                                <header className="space-y-1">
                                    <h3 className="font-display font-bold text-lg">Page Structure</h3>
                                    <p className="text-sm text-white/40">Manage your store blocks</p>
                                </header>

                                <div className="space-y-3">
                                    {theme.layout_home.map((block, idx) => (
                                        <div
                                            key={block.id}
                                            className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-white/10 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col gap-1 text-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        disabled={idx === 0}
                                                        onClick={(e) => { e.stopPropagation(); reorderBlocks(idx, idx - 1); }}
                                                        className="hover:text-white disabled:opacity-0"
                                                    >
                                                        <ArrowUp className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        disabled={idx === theme.layout_home.length - 1}
                                                        onClick={(e) => { e.stopPropagation(); reorderBlocks(idx, idx + 1); }}
                                                        className="hover:text-white disabled:opacity-0"
                                                    >
                                                        <ArrowDown className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 text-xs font-bold">
                                                    {idx + 1}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0" role="button" onClick={() => setEditingBlockId(block.id)}>
                                                <p className="text-sm font-bold text-white/80">{block.type.replace('_', ' ').toUpperCase()}</p>
                                                <p className="text-[10px] text-white/20 font-mono truncate">{block.id}</p>
                                            </div>
                                            <button
                                                onClick={() => setEditingBlockId(block.id)}
                                                className="p-1.5 text-white/20 hover:text-white transition-all bg-white/5 rounded-lg"
                                            >
                                                <Settings className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    <div className="relative">
                                        <button
                                            onClick={() => setShowAddMenu(!showAddMenu)}
                                            className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-white/20 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-bold flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add New Block
                                        </button>

                                        {showAddMenu && (
                                            <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-[#121216] border border-white/10 rounded-xl shadow-xl z-10 grid gap-1">
                                                {["hero_v1", "product_grid", "marquee"].map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => handleAddBlock(type as BlockType)}
                                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-left transition-colors"
                                                    >
                                                        <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center">
                                                            <Plus className="w-4 h-4 text-white/40" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{type.replace("_", " ").toUpperCase()}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Save Button */}
            <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold shadow-[0_10px_20px_rgba(254,117,1,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Save Theme
                </button>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-4 transition-all relative ${active ? "text-primary" : "text-white/40 hover:text-white/60"
                }`}
        >
            {icon}
            <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
            {active && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_-2px_10px_rgba(254,117,1,0.5)]"
                />
            )}
        </button>
    );
}

function ColorInput({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <label className="text-xs font-medium text-white/60">{label}</label>
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-white/40 uppercase">{value}</span>
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-none p-0 overflow-hidden"
                />
            </div>
        </div>
    );
}

function PreviewFrame({ products }: { products?: Product[] }) {
    const { theme } = useTheme();
    const [view, setView] = useState<"desktop" | "mobile">("desktop");

    useEffect(() => {
        registerAllBlocks();
    }, []);

    return (
        <CurrencyProvider>
            <div className="flex flex-col h-full bg-[#050505] overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setView("desktop")}
                            className={`p-2 rounded-lg transition-all ${view === "desktop" ? "bg-primary/20 text-primary" : "text-white/20 hover:text-white"}`}
                        >
                            <Monitor className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setView("mobile")}
                            className={`p-2 rounded-lg transition-all ${view === "mobile" ? "bg-primary/20 text-primary" : "text-white/20 hover:text-white"}`}
                        >
                            <Smartphone className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Live Preview</span>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
                    <div className={`mx-auto transition-all duration-500 bg-background shadow-2xl relative ${view === "mobile" ? "max-w-[375px] rounded-[3rem] border-[12px] border-black h-[750px] overflow-y-auto" : "w-full max-w-5xl rounded-2xl min-h-full"
                        }`}>
                        {/* Floating URL Bar for Mobile */}
                        {view === "mobile" && (
                            <div className="sticky top-0 z-50 p-6 pt-10 bg-background border-b border-white/5">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full">
                                    <div className="p-1 rounded bg-primary/20">
                                        <Monitor className="w-3 h-3 text-primary" />
                                    </div>
                                    <span className="text-[10px] text-white/40 truncate">store.aurastore.com</span>
                                </div>
                            </div>
                        )}

                        <LayoutRenderer layout={theme.layout_home} products={products} />

                        {/* Home Indicator for Mobile */}
                        {view === "mobile" && (
                            <div className="sticky bottom-2 left-0 right-0 h-1 w-20 mx-auto bg-white/10 rounded-full" />
                        )}
                    </div>
                </div>
            </div>
        </CurrencyProvider>
    );
}

export function ThemeEditor({ storeId, storeSlug, initialTheme, products }: ThemeEditorProps) {
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        registerAllBlocks();
    }, []);

    const handleSave = async (theme: ThemeConfig) => {
        setIsSaving(true);
        try {
            const result = await updateStore({
                id: storeId,
                theme_config: theme,
            });
            if (result.error) {
                alert(typeof result.error === "string" ? result.error : "Failed to save theme");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ThemeProvider initialTheme={initialTheme}>
            <InnerEditor isSaving={isSaving} handleSave={handleSave} products={products} />
        </ThemeProvider>
    );
}

function InnerEditor({ isSaving, handleSave, products }: { isSaving: boolean, handleSave: (t: ThemeConfig) => Promise<void>, products?: Product[] }) {
    const { theme } = useTheme();

    return (
        <div className="fixed inset-0 top-16 left-64 flex overflow-hidden">
            <div className="w-80 h-full flex-shrink-0">
                <EditorPanel isSaving={isSaving} handleSave={() => handleSave(theme)} />
            </div>
            <div className="flex-1 h-full">
                <PreviewFrame products={products} />
            </div>
        </div>
    );
}
