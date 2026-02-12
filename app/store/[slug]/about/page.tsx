import { notFound } from "next/navigation";
import { ThemeProvider } from "@/lib/theme-engine/context";
import { getStoreBySlug } from "@/lib/actions/store";
import { DEFAULT_THEME, ThemeConfig } from "@/lib/theme-engine/types";
import { StorefrontWrapper } from "@/components/storefront/wrapper";
import { Info, Target, Users, Zap } from "lucide-react";

interface AboutPageProps {
    params: {
        slug: string;
    };
}

export default async function AboutPage({ params }: AboutPageProps) {
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
                <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto space-y-16">
                    {/* Header */}
                    <div className="space-y-4 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--theme-primary,#FE7501)]/10 border border-[var(--theme-primary,#FE7501)]/20 rounded-full">
                            <Info className="w-4 h-4 text-[var(--theme-primary,#FE7501)]" />
                            <span className="text-[10px] font-black text-[var(--theme-primary,#FE7501)] uppercase tracking-widest">Notre Histoire</span>
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            À Propos de <span className="text-[var(--theme-primary,#FE7501)] italic">{store.name}</span>
                        </h1>
                        <p className="text-white/40 max-w-xl mx-auto font-medium">
                            {store.description || "Découvrez l'essence de notre marque et notre engagement envers l'excellence."}
                        </p>
                    </div>

                    {/* Mission Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-3xl bg-white/5 flex items-center justify-center">
                                <Target className="w-8 h-8 text-[var(--theme-primary,#FE7501)]" />
                            </div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">Notre Vision</h3>
                            <p className="text-white/40 text-sm leading-relaxed">
                                Redéfinir les standards du commerce digital en offrant une expérience immersive et luxueuse à chaque client.
                            </p>
                        </div>

                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-3xl bg-white/5 flex items-center justify-center">
                                <Zap className="w-8 h-8 text-[var(--theme-primary,#FE7501)]" />
                            </div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">Notre Passion</h3>
                            <p className="text-white/40 text-sm leading-relaxed">
                                Chaque produit que nous sélectionnons reflète notre dévouement à la qualité et au design innovant.
                            </p>
                        </div>

                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-3xl bg-white/5 flex items-center justify-center">
                                <Users className="w-8 h-8 text-[var(--theme-primary,#FE7501)]" />
                            </div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">Notre Communauté</h3>
                            <p className="text-white/40 text-sm leading-relaxed">
                                Vous êtes au cœur de notre évolution. Nous construisons cet empire ensemble, pas à pas.
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="glass-card p-12 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                        <div className="prose prose-invert max-w-none">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">L'Elite du Storefront</h2>
                            <p className="text-white/60 leading-relaxed text-lg">
                                Fondée sur des principes de design "Volcanic Luxe", <strong>{store.name}</strong> n'est pas seulement une boutique en ligne.
                                C'est une destination pour ceux qui ne se contentent pas de l'ordinaire. Nous fusionnons la technologie de pointe
                                d'<strong>AuraStore</strong> avec une curation méticuleuse pour vous offrir le meilleur.
                            </p>
                            <p className="text-white/60 leading-relaxed text-lg mt-4">
                                Notre engagement est simple : Qualité sans compromis, Service d'exception, et une Aura qui vous appartient.
                            </p>
                        </div>
                    </div>
                </div>
            </StorefrontWrapper>
        </ThemeProvider>
    );
}
