import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import { siteConfig } from "@/lib/config";
import "./globals.css";

const sora = Sora({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    variable: "--font-sora",
    display: 'swap'
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    variable: "--font-dm-sans",
    display: 'swap'
});

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: ["e-commerce", "SaaS", "IA", "Afrique", "High-Vibe", "Immersif"],
    authors: [{ name: "AuraStore Team" }],
    openGraph: {
        title: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        siteName: siteConfig.name,
        locale: "fr_FR",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: siteConfig.name,
        description: siteConfig.description,
        creator: "@aurastore",
    },
};

import { Toaster } from "sonner";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" className={`${sora.variable} ${dmSans.variable}`}>
            <body className="font-body text-white antialiased overflow-x-hidden selection:bg-primary selection:text-white">
                {/* Global Background Layers */}
                <div className="fixed inset-0 z-[-1] bg-volcanic-radial opacity-[0.2] pointer-events-none" />
                <div className="fixed inset-0 z-[-1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] brightness-150 contrast-150 pointer-events-none mix-blend-overlay" />

                {children}
                <Toaster position="bottom-right" theme="dark" closeButton richColors />
            </body>
        </html>
    );
}
