import { notFound } from "next/navigation";
import { ThemeProvider } from "@/lib/theme-engine/context";
import { getStoreBySlug } from "@/lib/actions/store";
import { DEFAULT_THEME, ThemeConfig } from "@/lib/theme-engine/types";
import { StorefrontWrapper } from "@/components/storefront/wrapper";
import { HelpCircle, ChevronDown } from "lucide-react";

interface FAQPageProps {
    params: {
        slug: string;
    };
}

export default async function FAQPage({ params }: FAQPageProps) {
    const supabase = createClient();

    // Fetch store by slug using cached action
    const store = await getStoreBySlug(params.slug);

    if (!store || !store.is_active) {
        notFound();
    }

    const themeConfig: ThemeConfig = store.theme_config || DEFAULT_THEME;

    const faqs = [
        {
            q: "Quels sont les délais de livraison ?",
            a: "Nous livrons généralement sous 3 à 5 jours ouvrables. Les délais peuvent varier en fonction de votre localisation et du mode de livraison choisi."
        },
        {
            q: "Puis-je retourner un produit ?",
            a: "Oui, vous disposez de 14 jours après réception pour demander un retour si l'article ne vous convient pas, sous réserve qu'il soit dans son état d'origine."
        },
        {
            q: "Quels modes de paiement acceptez-vous ?",
            a: "Nous acceptons les paiements via Stripe (Carte Bancaire), PayPal, ainsi que les paiements par Mobile Money via WhatsApp."
        },
        {
            q: "Comment suivre ma commande ?",
            a: "Une fois votre commande expédiée, vous recevrez un numéro de suivi par email pour suivre l'acheminement de votre colis en temps réel."
        }
    ];

    return (
        <ThemeProvider initialTheme={themeConfig}>
            <StorefrontWrapper store={store} products={[]}>
                <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="space-y-4 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--theme-primary,#FE7501)]/10 border border-[var(--theme-primary,#FE7501)]/20 rounded-full">
                            <HelpCircle className="w-4 h-4 text-[var(--theme-primary,#FE7501)]" />
                            <span className="text-[10px] font-black text-[var(--theme-primary,#FE7501)] uppercase tracking-widest">Questions Fréquentes</span>
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            Besoin d'aide <span className="text-[var(--theme-primary,#FE7501)] italic">?</span>
                        </h1>
                        <p className="text-white/40 max-w-xl mx-auto font-medium">
                            Retrouvez les réponses aux questions les plus posées par notre communauté.
                        </p>
                    </div>

                    {/* FAQ Accordion */}
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="glass-card p-6 rounded-2xl border border-white/5 space-y-3 group cursor-pointer hover:border-white/10 transition-all">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white group-hover:text-[var(--theme-primary,#FE7501)] transition-colors">{faq.q}</h3>
                                    <ChevronDown className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                                </div>
                                <p className="text-white/40 text-sm leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Contact Support */}
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl text-center space-y-4">
                        <p className="text-white/60 font-medium">Vous n'avez pas trouvé votre réponse ?</p>
                        <button className="px-8 py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all">
                            Contacter le Support
                        </button>
                    </div>
                </div>
            </StorefrontWrapper>
        </ThemeProvider>
    );
}
