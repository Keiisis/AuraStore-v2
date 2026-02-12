import { createClient } from "@/lib/supabase/server";
import { Store, Globe, Package, ExternalLink, MoreVertical, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function AdminStoresPage() {
    const supabase = createClient();

    const { data: stores } = await supabase
        .from("stores")
        .select("*, profiles(email, full_name)")
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                    <Store className="w-8 h-8 text-primary" />
                    Boutiques
                </h2>
                <p className="text-[11px] text-white/30 font-bold uppercase tracking-[0.2em]">Platform Store Monitoring & Performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores?.map((store: any) => (
                    <div key={store.id} className="volcanic-glass p-6 space-y-6 group hover:border-primary/20 transition-all">
                        <div className="flex justify-between items-start">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/5 overflow-hidden relative">
                                {store.logo_url ? (
                                    <Image
                                        src={store.logo_url}
                                        alt={store.name}
                                        fill
                                        className="object-contain p-2"
                                    />
                                ) : (
                                    <Store className="w-6 h-6 text-white/10" />
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${store.is_active
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                    {store.is_active ? 'Live' : 'Inactive'}
                                </span>
                                <Link
                                    href={`/dashboard/${store.slug}`}
                                    className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-all"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">{store.name}</h3>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{store.slug}.aurastore.com</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                            <div>
                                <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mb-1">Propriétaire</p>
                                <p className="text-[10px] text-white font-bold truncate">{store.profiles?.full_name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mb-1">Catégorie</p>
                                <p className="text-[10px] text-primary font-black uppercase tracking-tighter italic">{store.category || 'Général'}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-3 h-3 text-emerald-400" />
                                <span className="text-[10px] font-black text-white">0€ <span className="text-white/20 tracking-tighter">Volume</span></span>
                            </div>
                            <p className="text-[9px] text-white/20 font-bold uppercase">{new Date(store.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
