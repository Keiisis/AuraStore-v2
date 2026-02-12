import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Package, Plus, Search, Filter, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { getStoreProducts } from "@/lib/actions/product";

interface ProductsPageProps {
    params: {
        slug: string;
    };
}

export default async function ProductsPage({ params }: ProductsPageProps) {
    const { slug } = params;
    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get store details
    const { data: store } = await supabase
        .from("stores")
        .select("id, name")
        .eq("slug", slug)
        .eq("owner_id", user.id)
        .single();

    if (!store) {
        notFound();
    }

    // Get products
    const products = await getStoreProducts(store.id);

    return (
        <div className="space-y-6 scale-[0.98] transform-gpu">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-0.5">
                    <p className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">Inventaire</p>
                    <h1 className="font-display text-2xl font-black text-white">
                        Catalogue Produits
                    </h1>
                </div>
                <Link
                    href={`/dashboard/${slug}/products/new`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black rounded-xl shadow-[0_10px_20px_rgba(254,117,1,0.2)] hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
                >
                    <Plus className="w-3.5 h-3.5 fill-current" />
                    Nouveau Produit
                </Link>
            </div>

            {/* Filter Bar Compact */}
            <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-primary/30 transition-all text-[11px] text-white font-bold"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/[0.05] rounded-xl text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all">
                    <Filter className="w-3.5 h-3.5" />
                    Filtres
                </button>
            </div>

            {/* Products Table Elite */}
            <div className="glass-card rounded-[2rem] overflow-hidden border border-white/[0.03]">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-white/[0.05] bg-white/[0.01]">
                                <th className="px-6 py-4 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Produit</th>
                                <th className="px-6 py-4 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Catégorie</th>
                                <th className="px-6 py-4 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Prix</th>
                                <th className="px-6 py-4 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Stock</th>
                                <th className="px-6 py-4 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Statut</th>
                                <th className="px-6 py-4 text-[9px] font-black text-white/20 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <Package className="w-10 h-10 mx-auto mb-3 text-white/5" />
                                        <p className="text-[11px] font-bold text-white/20 uppercase tracking-wider">Aucun produit détecté</p>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="group hover:bg-white/[0.01] transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.05] overflow-hidden flex-shrink-0 relative group-hover:border-primary/20 transition-colors">
                                                    {product.images && product.images[0] ? (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-4 h-4 text-white/10" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{product.name}</p>
                                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-tighter">/{product.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-tight">{product.category || "Standard"}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <p className="text-xs font-black text-white tracking-tight">${Number(product.price).toFixed(2)}</p>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1 h-1 rounded-full ${product.stock && product.stock > 5 ? "bg-green-500" : "bg-orange-500"}`} />
                                                <span className={`text-[10px] font-bold ${product.stock && product.stock > 5 ? "text-white/40" : "text-orange-500"}`}>
                                                    {product.stock || 0} UNI.
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            {product.is_active ? (
                                                <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-[0.15em] text-green-500 bg-green-500/10 border border-green-500/10">Actif</span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-[0.15em] text-white/20 bg-white/5 border border-white/5">Brouillon</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/dashboard/${slug}/products/${product.id}`}
                                                    className="p-1.5 text-white/40 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Link>
                                                <button className="p-1.5 text-white/40 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
