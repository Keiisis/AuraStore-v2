"use client";

import { ReactNode, useEffect } from "react";
import { Store, Product } from "@/lib/supabase/types";
import { registerAllBlocks } from "@/components/blocks";
import { StorefrontHeader } from "./header";
import { StorefrontFooter } from "./footer";
import { AuraOmniVoice } from "@/components/shared/aura-omni-voice";

import { CurrencyProvider } from "@/lib/theme-engine/currency-context";
import { CartProvider } from "@/components/store/cart-context";
import { CartDrawer } from "@/components/store/cart-drawer";

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
                    <AuraOmniVoice storeId={store.id} context="customer" />

                    <main className="flex-1">
                        {children}
                    </main>
                    <StorefrontFooter store={store} />
                </div>
            </CartProvider>
        </CurrencyProvider>
    );
}
