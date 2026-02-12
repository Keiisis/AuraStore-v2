import { notFound } from "next/navigation";
import { ThemeProvider } from "@/lib/theme-engine/context";
import { getStoreBySlug } from "@/lib/actions/store";
import { DEFAULT_THEME, ThemeConfig } from "@/lib/theme-engine/types";
import { StorefrontWrapper } from "@/components/storefront/wrapper";
import { Shield, Eye, Lock, FileText } from "lucide-react";

interface PrivacyPageProps {
    params: {
        slug: string;
    };
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
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
                            <Shield className="w-4 h-4 text-[var(--theme-primary,#FE7501)]" />
                            <span className="text-[10px] font-black text-[var(--theme-primary,#FE7501)] uppercase tracking-widest">Confidentialité & Sécurité</span>
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            Politique de <span className="text-[var(--theme-primary,#FE7501)] italic">Confidentialité</span>
                        </h1>
                        <p className="text-white/40 max-w-xl mx-auto font-medium">
                            Votre vie privée est sacrée. Nous protégeons vos données avec la plus grande rigueur technologique.
                        </p>
                    </div>

                    {/* Content Section */}
                    <div className="glass-card p-8 md:p-12 rounded-[2.5rem] border border-white/5 space-y-10">
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Eye className="w-6 h-6 text-[var(--theme-primary,#FE7501)]" />
                                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Collecte des Données</h2>
                            </div>
                            <p className="text-white/60 leading-relaxed">
                                Nous collectons uniquement les informations nécessaires au traitement de vos commandes et à l'amélioration de votre expérience shopping : nom, adresse, email et données de navigation.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Lock className="w-6 h-6 text-[var(--theme-primary,#FE7501)]" />
                                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Sécurité & Paiement</h2>
                            </div>
                            <p className="text-white/60 leading-relaxed">
                                Vos transactions sont cryptées via des protocoles SSL haute sécurité. Nous ne stockons jamais vos informations de carte bancaire sur nos serveurs.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6 text-[var(--theme-primary,#FE7501)]" />
                                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Utilisation des Cookies</h2>
                            </div>
                            <p className="text-white/60 leading-relaxed">
                                Les cookies nous permettent de mémoriser votre panier et vos préférences. Vous pouvez les désactiver dans les réglages de votre navigateur à tout moment.
                            </p>
                        </section>

                        <div className="pt-6 border-t border-white/5">
                            <p className="text-white/40 text-xs italic">Dernière mise à jour : 11 Février 2026</p>
                        </div>
                    </div>
                </div>
            </StorefrontWrapper>
        </ThemeProvider>
    );
}
