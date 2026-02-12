import { notFound } from "next/navigation";
import { ThemeProvider } from "@/lib/theme-engine/context";
import { getStoreBySlug } from "@/lib/actions/store";
import { DEFAULT_THEME, ThemeConfig } from "@/lib/theme-engine/types";
import { StorefrontWrapper } from "@/components/storefront/wrapper";
import { RotateCcw, AlertTriangle, CheckCircle2, ShieldOff } from "lucide-react";

interface ReturnsPageProps {
    params: {
        slug: string;
    };
}

export default async function ReturnsPage({ params }: ReturnsPageProps) {
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
                            <RotateCcw className="w-4 h-4 text-[var(--theme-primary,#FE7501)]" />
                            <span className="text-[10px] font-black text-[var(--theme-primary,#FE7501)] uppercase tracking-widest">Satisfaction Garantie</span>
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            Retours <span className="text-[var(--theme-primary,#FE7501)] italic">&</span> Echanges
                        </h1>
                        <p className="text-white/40 max-w-xl mx-auto font-medium">
                            Votre satisfaction est notre priorité absolue. Si vous n'êtes pas satisfait, nous vous aidons à corriger cela.
                        </p>
                    </div>

                    {/* Return Steps */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight text-center">Comment effectuer un retour ?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 text-center">
                                <div className="w-10 h-10 mx-auto rounded-full bg-white/5 flex items-center justify-center font-black text-[var(--theme-primary,#FE7501)]">1</div>
                                <h3 className="font-bold text-white">Contactez-nous</h3>
                                <p className="text-white/40 text-xs">Envoyez une demande sous 14 jours via WhatsApp ou email.</p>
                            </div>
                            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 text-center">
                                <div className="w-10 h-10 mx-auto rounded-full bg-white/5 flex items-center justify-center font-black text-[var(--theme-primary,#FE7501)]">2</div>
                                <h3 className="font-bold text-white">Préparez le colis</h3>
                                <p className="text-white/40 text-xs">Remettez l'article dans son emballage d'origine intact.</p>
                            </div>
                            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 text-center">
                                <div className="w-10 h-10 mx-auto rounded-full bg-white/5 flex items-center justify-center font-black text-[var(--theme-primary,#FE7501)]">3</div>
                                <h3 className="font-bold text-white">Remboursement</h3>
                                <p className="text-white/40 text-xs">Recevez votre remboursement après inspection du produit.</p>
                            </div>
                        </div>
                    </div>

                    {/* Important Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                Articles Acceptés
                            </h3>
                            <ul className="space-y-2 text-sm text-white/60 list-disc list-inside">
                                <li>État neuf avec étiquettes d'origine</li>
                                <li>Non porté, non lavé, non utilisé</li>
                                <li>Emballage d'origine non endommagé</li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShieldOff className="w-5 h-5 text-red-500" />
                                Articles Non-Retournables
                            </h3>
                            <ul className="space-y-2 text-sm text-white/60 list-disc list-inside">
                                <li>Sous-vêtements et maillots de bain</li>
                                <li>Produits d'hygiène ou cosmétiques ouverts</li>
                                <li>Articles en promotion finale ou liquidation</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </StorefrontWrapper>
        </ThemeProvider>
    );
}
