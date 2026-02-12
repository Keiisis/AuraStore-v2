"use client";

import { ReactNode, useEffect } from "react";
import { Store, Product } from "@/lib/supabase/types";
import { registerAllBlocks } from "@/components/blocks";
import dynamic from "next/dynamic";

const StorefrontHeader = dynamic(() => import("./header").then(mod => mod.StorefrontHeader));
const StorefrontFooter = dynamic(() => import("./footer").then(mod => mod.StorefrontFooter));
const AuraOmniVoice = dynamic(() => import("@/components/shared/aura-omni-voice").then(mod => mod.AuraOmniVoice), { ssr: false });
const CartDrawer = dynamic(() => import("@/components/store/cart-drawer").then(mod => mod.CartDrawer), { ssr: false });

import { CurrencyProvider } from "@/lib/theme-engine/currency-context";
import { CartProvider } from "@/components/store/cart-context";

interface StorefrontWrapperProps {
    store: Store;
    products: Product[];
    children: ReactNode;
}

// Register all blocks immediately at module level to ensure they are available for initial render
registerAllBlocks();

export function StorefrontWrapper({ store, products, children }: StorefrontWrapperProps) {
    return (
        <CurrencyProvider>
            <CartProvider>
                <div className="min-h-screen flex flex-col">
                    <StorefrontHeader store={store} />
                    <CartDrawer store={store} />

                    {/* Aura AI Concierge (Voice) */}
                    <AuraOmniVoice stores={[store]} context="customer" />

                    <main className="flex-1">
                        {children}
                    </main>
                    <StorefrontFooter store={store} />
                </div>
            </CartProvider>
        </CurrencyProvider>
    );
}
