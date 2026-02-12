"use client";

import { ThemesEditor } from "@/components/admin/themes-editor";
import { AIConfigEditor } from "@/components/admin/ai-config-editor";
import { BlogAutomationControl } from "@/components/admin/blog-automation-control";

export const dynamic = "force-dynamic";

export default function AdminThemesPage() {
    return (
        <div className="space-y-8">
            <header className="bg-[#0A0A0C] border-b border-white/5 p-8 flex justify-between items-center sticky top-0 z-50 backdrop-blur-xl bg-opacity-80">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                        Design <span className="text-primary">System</span> & IA
                    </h1>
                    <p className="text-white/40 text-sm font-medium mt-1">Gérez l'ADN visuel et la puissance de calcul VTO</p>
                </div>
            </header>

            <div className="px-8 pb-12 max-w-7xl mx-auto space-y-12">
                {/* AI Power Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/20">VTO Powerhouse & Plume IA</h2>
                    </div>
                    <AIConfigEditor />
                </section>

                <div className="h-px bg-white/5 w-full" />

                {/* Blog Automation */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/20">Flux de Pensée Autonome</h2>
                    </div>
                    <BlogAutomationControl />
                </section>

                <div className="h-px bg-white/5 w-full" />

                {/* Themes Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/20">Identités Visuelles</h2>
                    </div>
                    <ThemesEditor />
                </section>
            </div>
        </div>
    );
}
