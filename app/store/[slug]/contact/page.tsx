import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ThemeProvider } from "@/lib/theme-engine/context";
import { DEFAULT_THEME, ThemeConfig } from "@/lib/theme-engine/types";
import { StorefrontWrapper } from "@/components/storefront/wrapper";
import { Mail, Phone, MapPin, Send } from "lucide-react";

interface ContactPageProps {
    params: {
        slug: string;
    };
}

export default async function ContactPage({ params }: ContactPageProps) {
    const supabase = createClient();

    // Fetch store by slug
    const { data: store, error } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", params.slug)
        .eq("is_active", true)
        .single();

    if (error || !store) {
        notFound();
    }

    const themeConfig: ThemeConfig = store.theme_config || DEFAULT_THEME;

    return (
        <ThemeProvider initialTheme={themeConfig}>
            <StorefrontWrapper store={store} products={[]}>
                <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto space-y-16">
                    {/* Header */}
                    <div className="space-y-4 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--theme-primary,#FE7501)]/10 border border-[var(--theme-primary,#FE7501)]/20 rounded-full">
                            <Send className="w-4 h-4 text-[var(--theme-primary,#FE7501)]" />
                            <span className="text-[10px] font-black text-[var(--theme-primary,#FE7501)] uppercase tracking-widest">Contactez-nous</span>
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            Entrez dans le <span className="text-[var(--theme-primary,#FE7501)] italic">Hangar</span>
                        </h1>
                        <p className="text-white/40 max-w-xl mx-auto font-medium">
                            Besoin d'assistance ou d'informations ? Notre équipe est prête à répondre à vos appels.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="glass-card p-8 rounded-[2rem] border border-white/5 space-y-6">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Coordonnées</h3>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--theme-primary,#FE7501)]">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">WhatsApp & Appel</p>
                                            <p className="text-white font-bold">{store.whatsapp_number || "Non configuré"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--theme-primary,#FE7501)]">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Email Support</p>
                                            <p className="text-white font-bold">contact@{store.slug}.aurastore.com</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--theme-primary,#FE7501)]">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Siège Social</p>
                                            <p className="text-white font-bold">Abidjan, Côte d'Ivoire</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="glass-card p-8 rounded-[2rem] border border-white/5">
                            <form className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Nom Complet</label>
                                    <input
                                        type="text"
                                        placeholder="Votre nom..."
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[var(--theme-primary,#FE7501)]/50 transition-colors font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Email</label>
                                    <input
                                        type="email"
                                        placeholder="votre@email.com"
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[var(--theme-primary,#FE7501)]/50 transition-colors font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Message</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Comment pouvons-nous vous aider ?"
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[var(--theme-primary,#FE7501)]/50 transition-colors font-medium resize-none"
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="w-full py-4 bg-[var(--theme-primary,#FE7501)] text-white font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[var(--theme-primary,#FE7501)]/20"
                                >
                                    Envoyer le Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </StorefrontWrapper>
        </ThemeProvider>
    );
}
