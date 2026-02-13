"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { Product } from "@/lib/supabase/types";
import { toast } from "sonner";

interface CartItem {
    id: string; // Composite ID: product_id-color-size
    productId: string;
    product: Product;
    quantity: number;
    color: string | null;
    size: string | null;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, quantity: number, color: string | null, size: string | null) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    // FIX: Nouvel état exposé — true uniquement après restauration du localStorage
    isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
    children: ReactNode;
    storeId: string;
}

export function CartProvider({ children, storeId }: CartProviderProps) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // FIX: État qui track si le localStorage a été lu
    const [isLoaded, setIsLoaded] = useState(false);

    const storageKey = `aurastore-cart-${storeId}`;

    // Persist cart to localStorage
    useEffect(() => {
        setIsMounted(true);
        const storedCart = localStorage.getItem(storageKey);
        if (storedCart) {
            try {
                const parsedItems = JSON.parse(storedCart);
                // Security: Filter out items that don't belong to this store (if any leaked in)
                const validItems = parsedItems.filter((item: CartItem) => item.product.store_id === storeId);
                setItems(validItems);
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        // FIX: Marquer comme chargé APRÈS la restauration (que le localStorage soit vide ou non)
        setIsLoaded(true);
    }, [storageKey, storeId]);

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem(storageKey, JSON.stringify(items));
        }
    }, [items, isMounted, storageKey]);

    const addToCart = (product: Product, quantity: number, color: string | null, size: string | null) => {
        // Double check store mismatch before adding
        if (product.store_id !== storeId) {
            console.error("Attempted to add product from different store");
            return;
        }

        const itemId = `${product.id}-${color || 'default'}-${size || 'default'}`;

        setItems((currentItems) => {
            const existingItem = currentItems.find((item) => item.id === itemId);

            if (existingItem) {
                toast.success("Quantité mise à jour dans le panier !");
                return currentItems.map((item) =>
                    item.id === itemId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            toast.success("Produit ajouté au panier !");
            return [
                ...currentItems,
                { id: itemId, productId: product.id, product, quantity, color, size },
            ];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (itemId: string) => {
        setItems((items) => items.filter((item) => item.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(itemId);
            return;
        }
        setItems((items) =>
            items.map((item) => (item.id === itemId ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const cartCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);
    const cartTotal = useMemo(() => items.reduce((acc, item) => acc + (item.product.price || 0) * item.quantity, 0), [items]);

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                isCartOpen,
                openCart,
                closeCart,
                // FIX: Exposer isLoaded
                isLoaded,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
