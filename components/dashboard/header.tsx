"use client";

import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import {
    Bell, Search, Menu, LogOut, User as UserIcon, Zap, Check, X,
    LayoutDashboard, Package, ShoppingCart, Settings, Palette, BarChart3,
    Store as StoreIcon, Plus, Magnet, Sparkles, Crown, ExternalLink
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNotificationStore } from "@/lib/store/use-notification-store";
import { Store } from "@/lib/supabase/types";

interface DashboardHeaderProps {
    user: User;
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

export function DashboardHeader({ user, stores }: DashboardHeaderProps) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const { notifications, unreadCount, markAsRead, clearAll } = useNotificationStore();
    const count = unreadCount();
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    // Close mobile menu on route change
    useEffect(() => {
        setShowMobileMenu(false);
    }, [pathname]);

    // Check store context for navigation links
    const pathSegments = pathname.split("/").filter(Boolean);
    const isStoreContext = pathSegments.length >= 2 && pathSegments[0] === "dashboard" && pathSegments[1] !== "new-store";
    const storeSlug = isStoreContext ? pathSegments[1] : (stores.length > 0 ? stores[0]?.slug : null);

    const currentNavItems = navItems.map(item => {
        if (!storeSlug || item.href === "/dashboard") return item;
        const subPath = item.href.replace("/dashboard/", "");
        return {
            ...item,
            href: `/dashboard/${storeSlug}/${subPath}`
        };
    });

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-[#08080A]/80 backdrop-blur-2xl border-b border-white/[0.03] z-50">
            <div className="h-full px-4 flex items-center justify-between">
                {/* Left: Logo & Mobile Menu */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowMobileMenu(true)}
                        className="lg:hidden p-2 hover:bg-white/5 rounded-lg active:scale-95 transition-all"
                    >
                        <Menu className="w-5 h-5 text-white/60" />
                    </button>

                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(254,117,1,0.3)]">
                            <Zap className="w-4 h-4 text-black fill-current" />
                        </div>
                        <span className="font-display font-black text-sm tracking-tighter uppercase italic hidden sm:block">
                            Aura<span className="text-primary not-italic">Store</span>
                        </span>
                    </Link>
                </div>

                {/* Center: Search Compact (Hidden on mobile) */}
                <div className="hidden md:flex flex-1 max-w-sm mx-12">
                    <div className="relative w-full group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="w-full pl-9 pr-4 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded-xl text-xs text-white placeholder:text-white/20 focus:outline-none focus:bg-white/[0.05] focus:border-primary/30 transition-all font-bold"
                        />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {/* Status Indicator */}
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-green-500/5 border border-green-500/10 rounded-full">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Connecté</span>
                    </div>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors group relative"
                        >
                            <Bell className={`w-4 h-4 ${count > 0 ? 'text-white' : 'text-white/40'} group-hover:text-white transition-colors`} />
                            {count > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-[#08080A] shadow-[0_0_8px_#fe7501]" />
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-[#121216] border border-white/5 rounded-[2rem] p-4 shadow-2xl backdrop-blur-3xl z-[60] animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Flux Aura</h4>
                                    <button
                                        onClick={clearAll}
                                        className="text-[9px] font-black text-white/20 hover:text-primary uppercase tracking-widest transition-colors"
                                    >
                                        Effacer
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {notifications.length > 0 ? (
                                        notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={`p-3 rounded-2xl border transition-all cursor-pointer group/notif ${n.read ? 'bg-white/[0.01] border-white/5 opacity-50' : 'bg-primary/5 border-primary/20 hover:border-primary/40'}`}
                                                onClick={() => markAsRead(n.id)}
                                            >
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="space-y-1">
                                                        <p className="text-[11px] font-black text-white tracking-tight uppercase">{n.title}</p>
                                                        <p className="text-[10px] text-white/40 font-medium leading-relaxed uppercase tracking-tighter italic">{n.message}</p>
                                                        <p className="text-[8px] text-white/20 font-black">{n.time}</p>
                                                    </div>
                                                    {!n.read && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shadow-[0_0_5px_#fe7501]" />
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 space-y-2">
                                            <Bell className="w-8 h-8 text-white/5 mx-auto" />
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">Aucune alerte Aura</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 pl-2 pr-1 py-1 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] rounded-xl transition-all"
                        >
                            <span className="hidden sm:block text-[10px] font-black tracking-tight text-white/40 uppercase pl-2">
                                {user.email?.split('@')[0]}
                            </span>
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/5">
                                <UserIcon className="w-3.5 h-3.5 text-white/60" />
                            </div>
                        </button>

                        {/* Dropdown */}
                        {showUserMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#121216] border border-white/5 rounded-xl p-1.5 shadow-2xl backdrop-blur-3xl">
                                <Link
                                    href="/dashboard/settings"
                                    className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                >
                                    <UserIcon className="w-3.5 h-3.5" />
                                    Paramètres Profil
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    Déconnexion
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setShowMobileMenu(false)}
                    />

                    {/* Menu Panel */}
                    <div className="absolute left-0 top-0 bottom-0 w-[80%] max-w-sm bg-[#0E0E12] border-r border-white/5 shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                        <div className="h-14 flex items-center justify-between px-4 border-b border-white/5">
                            <span className="font-display font-black text-sm tracking-tighter uppercase italic text-white">
                                Menu <span className="text-primary not-italic">Mobile</span>
                            </span>
                            <button
                                onClick={() => setShowMobileMenu(false)}
                                className="p-2 hover:bg-white/5 rounded-lg text-white/60"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Stores */}
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] px-2">
                                    Boutiques
                                </p>
                                {stores.map((store) => {
                                    const isSelected = storeSlug === store.slug;
                                    return (
                                        <Link
                                            key={store.id}
                                            href={`/dashboard/${store.slug}`}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isSelected ? "bg-primary/10" : "hover:bg-white/5"}`}
                                        >
                                            <div className={`w-8 h-8 rounded-md flex items-center justify-center overflow-hidden ${isSelected ? "bg-primary text-black" : "bg-white/5 text-white/40"}`}>
                                                {store.logo_url ? (
                                                    <img src={store.logo_url} alt="" className="w-full h-full object-contain p-1" />
                                                ) : (
                                                    <StoreIcon className="w-4 h-4" />
                                                )}
                                            </div>
                                            <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-white/40"}`}>
                                                {store.name}
                                            </span>
                                        </Link>
                                    );
                                })}
                                <Link
                                    href="/dashboard/new-store"
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all text-white/20 hover:text-white"
                                >
                                    <div className="w-8 h-8 rounded-md border border-white/5 flex items-center justify-center hover:border-primary/30">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold">Nouvelle boutique</span>
                                </Link>
                            </div>

                            {/* Quick access to live store */}
                            {storeSlug && (
                                <a
                                    href={`/store/${storeSlug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group mt-2"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-[11px] font-black text-primary uppercase tracking-wider">
                                        Voir la boutique
                                    </span>
                                </a>
                            )}

                            {/* Navigation */}
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] px-2">
                                    Navigation
                                </p>
                                {currentNavItems.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive ? "text-primary bg-primary/5" : "text-white/40 hover:text-white hover:bg-white/5"
                                                }`}
                                        >
                                            <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                                            <span className="font-bold text-xs tracking-tight uppercase">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/5 bg-black/20">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
