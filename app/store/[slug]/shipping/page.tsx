import { notFound } from "next/navigation";
import { ThemeProvider } from "@/lib/theme-engine/context";
import { getStoreBySlug } from "@/lib/actions/store";
import { DEFAULT_THEME, ThemeConfig } from "@/lib/theme-engine/types";
import { StorefrontWrapper } from "@/components/storefront/wrapper";
import { Truck, Package, Clock, ShieldCheck } from "lucide-react";

interface ShippingPageProps {
    params: {
        slug: string;
    };
}

export default async function ShippingPage({ params }: ShippingPageProps) {
    const supabase = createClient();

    // Fetch store by slug using cached action
    const store = await getStoreBySlug(params.slug);

    if (!store || !store.is_active) {
        notFound();
    }

    const themeConfig: ThemeConfig = store.theme_config || DEFAULT_THEME;

    return (
        <ThemeProvider initialTheme={themeConfig}>
            <StorefrontWrapper store={store} products={[]}>
                <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="space-y-4 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--theme-primary,#FE7501)]/10 border border-[var(--theme-primary,#FE7501)]/20 rounded-full">
                            <Truck className="w-4 h-4 text-[var(--theme-primary,#FE7501)]" />
                            <span className="text-[10px] font-black text-[var(--theme-primary,#FE7501)] uppercase tracking-widest">Logistique & Livraison</span>
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            Expédition <span className="text-[var(--theme-primary,#FE7501)] italic">&</span> Livraison
                        </h1>
                        <p className="text-white/40 max-w-xl mx-auto font-medium">
                            Nous nous engageons à livrer votre aura partout dans le monde avec le plus grand soin.
                        </p>
                    </div>

                    {/* Policy Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-8 rounded-[2rem] border border-white/5 space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-[var(--theme-primary,#FE7501)]" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Délais de Traitement</h3>
                            <p className="text-white/60 text-sm leading-relaxed">
                                Toutes les commandes sont traitées sous 24 à 48 heures ouvrables. Dès que votre colis quitte notre hangar, vous recevez une notification immédiate.
                            </p>
                        </div>

                        <div className="glass-card p-8 rounded-[2rem] border border-white/5 space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                                <Package className="w-6 h-6 text-[var(--theme-primary,#FE7501)]" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Modes de Livraison</h3>
                            <p className="text-white/60 text-sm leading-relaxed">
                                Nous proposons plusieurs options de livraison adaptées à vos besoins : Standard, Express et Point Relais. Les tarifs sont calculés lors du passage à la caisse.
                            </p>
                        </div>

                        <div className="glass-card p-8 rounded-[2rem] border border-white/5 space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                                <Truck className="w-6 h-6 text-[var(--theme-primary,#FE7501)]" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Suivi de Commande</h3>
                            <p className="text-white/60 text-sm leading-relaxed">
                                Chaque expédition bénéficie d'un numéro de suivi unique accessible depuis votre espace client ou via le lien envoyé par email.
                            </p>
                        </div>

                        <div className="glass-card p-8 rounded-[2rem] border border-white/5 space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-[var(--theme-primary,#FE7501)]" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Protection des Colis</h3>
                            <p className="text-white/60 text-sm leading-relaxed">
                                Vos articles sont emballés avec des matériaux premium pour garantir une réception en parfait état, quelle que soit la destination.
                            </p>
                        </div>
                    </div>

                    {/* Extra Info */}
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl text-center">
                        <p className="text-white/30 text-sm uppercase tracking-[0.2em] font-bold">Une question sur votre livraison ?</p>
                        <p className="text-white/60 mt-2">Contactez notre support logistique directement via WhatsApp ou par email.</p>
                    </div>
                </div>
            </StorefrontWrapper>
        </ThemeProvider>
    );
}
