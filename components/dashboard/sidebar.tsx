"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Store } from "@/lib/supabase/types";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Settings,
    Palette,
    BarChart3,
    Store as StoreIcon,
    Plus,
    Shirt,
    Cpu,
    Sparkle,
    Palette as PaletteIcon,
    Gem,
    Home as HomeIcon,
    Dumbbell,
    Gamepad2,
    Briefcase,
    Zap,
    Magnet,
    Sparkles,
    Crown,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, any> = {
    clothing: Shirt,
    tech: Cpu,
    beauty: Sparkle,
    art: PaletteIcon,
    digital: Zap,
    luxury: Gem,
    home: HomeIcon,
    fitness: Dumbbell,
    gaming: Gamepad2,
    services: Briefcase,
};

interface DashboardSidebarProps {
    stores: Store[];
}

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Vue d'ensemble" },
    { href: "/dashboard/products", icon: Package, label: "Produits" },
    { href: "/dashboard/orders", icon: ShoppingCart, label: "Commandes" },
    { href: "/dashboard/marketing", icon: Magnet, label: "Marketing" },
    { href: "/dashboard/imagen", icon: Sparkles, label: "Imagen Lab" },
    { href: "/dashboard/analytics", icon: BarChart3, label: "Analyses" },
    { href: "/dashboard/editor", icon: Palette, label: "Éditeur Thème" },
    { href: "/dashboard/subscription", icon: Crown, label: "Mon Plan" },
    { href: "/dashboard/settings", icon: Settings, label: "Paramètres" },
];

export function DashboardSidebar({ stores }: DashboardSidebarProps) {
    const pathname = usePathname();

    // Check if we are in a store context
    const pathSegments = pathname.split("/").filter(Boolean);
    const isStoreContext = pathSegments.length >= 2 && pathSegments[0] === "dashboard" && pathSegments[1] !== "new-store";
    const storeSlug = isStoreContext ? pathSegments[1] : (stores.length > 0 ? stores[0].slug : null);

    const currentNavItems = navItems.map(item => {
        if (!storeSlug || item.href === "/dashboard") return item;

        // Convert /dashboard/products to /dashboard/[slug]/products
        const subPath = item.href.replace("/dashboard/", "");
        return {
            ...item,
            href: `/dashboard/${storeSlug}/${subPath}`
        };
    });

    return (
        <>
            {/* Sidebar */}
            <aside className="fixed left-0 top-16 bottom-0 w-56 bg-[#0E0E12] border-r border-white/5 z-50 hidden lg:block overflow-y-auto">
                <div className="p-3 space-y-5">
                    {/* Store Selector */}
                    <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] px-3">
                            Boutiques
                        </p>
                        <div className="space-y-0.5">
                            {stores.map((store) => {
                                const isSelected = storeSlug === store.slug;
                                return (
                                    <Link
                                        key={store.id}
                                        href={`/dashboard/${store.slug}`}
                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all group ${isSelected ? "bg-primary/10" : "hover:bg-white/5"
                                            }`}
                                    >
                                        <div className={`w-7 h-7 rounded-md flex items-center justify-center overflow-hidden ${isSelected ? "bg-primary text-black" : "bg-white/5 text-white/40 group-hover:text-white/60"
                                            }`}>
                                            {store.logo_url ? (
                                                <img src={store.logo_url} alt="" className="w-full h-full object-contain p-1" />
                                            ) : (
                                                (() => {
                                                    const Icon = (store as any).category ? CATEGORY_ICONS[(store as any).category] || StoreIcon : StoreIcon;
                                                    return <Icon className="w-3.5 h-3.5" />;
                                                })()
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[11px] font-bold truncate ${isSelected ? "text-white" : "text-white/40 group-hover:text-white/60"}`}>
                                                {store.name}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}

                            <Link
                                href="/dashboard/new-store"
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-dashed border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                            >
                                <div className="w-7 h-7 rounded-md border border-white/5 flex items-center justify-center group-hover:border-primary/30">
                                    <Plus className="w-3.5 h-3.5 text-white/20 group-hover:text-primary" />
                                </div>
                                <span className="text-[11px] font-bold text-white/20 group-hover:text-white">
                                    Créer boutique
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] px-3">
                            {isStoreContext ? "Outils Boutique" : "Navigation"}
                        </p>
                        <nav className="space-y-0.5">
                            {currentNavItems.map((item) => {
                                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative group ${isActive
                                            ? "text-primary bg-primary/5"
                                            : "text-white/40 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <item.icon className={`w-4 h-4 transition-colors ${isActive ? "text-primary" : "group-hover:text-white"}`} />
                                        <span className="font-bold text-[11px] tracking-tight uppercase">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Quick Stats Compact */}
                    <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5 mx-1">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-sm font-black text-white">0</p>
                                <p className="text-[8px] text-white/20 font-black uppercase tracking-tighter">Ventes</p>
                            </div>
                            <div>
                                <p className="text-sm font-black text-primary">0</p>
                                <p className="text-[8px] text-white/20 font-black uppercase tracking-tighter">Revenus</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
