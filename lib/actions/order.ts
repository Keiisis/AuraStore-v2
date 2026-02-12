"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const orderItemSchema = z.object({
    id: z.string().uuid(),
    quantity: z.number().int().positive(),
    variant: z.string().optional().nullable(),
});

const createOrderSchema = z.object({
    store_id: z.string().uuid(),
    customer_email: z.string().email(),
    customer_name: z.string().min(2),
    customer_phone: z.string().optional().nullable(),
    items: z.array(orderItemSchema), // Strict validation
    payment_method: z.enum(["whatsapp", "stripe", "cash", "paypal", "flutterwave", "fedapay", "kkiapay"]),
    shipping_address: z.any().optional().nullable(),
    notes: z.string().optional().nullable(),
    provider_order_id: z.string().optional().nullable(),
});

export async function createOrder(input: z.infer<typeof createOrderSchema>) {
    // Use Admin Client for backend order processing to bypass RLS/permission issues
    const { createClient: createAdminClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );

    // 1. Validate Store Existence
    const { data: store } = await supabaseAdmin
        .from("stores")
        .select("id")
        .eq("id", input.store_id)
        .single();

    if (!store) return { error: "Boutique introuvable" };

    // 2. Fetch Real Product Prices (Anti-Tampering)
    const productIds = input.items.map(item => item.id);
    const { data: products } = await supabaseAdmin
        .from("products")
        .select("id, price, name")
        .in("id", productIds)
        .eq("store_id", input.store_id);

    if (!products || products.length === 0) {
        return { error: "Aucun produit valide trouvé" };
    }

    const productMap = new Map(products.map(p => [p.id, p]));

    // 3. Recalculate Totals SERVER-SIDE
    let calculatedSubtotal = 0;
    const sanitizedItems = [];

    for (const item of input.items) {
        const product = productMap.get(item.id);
        if (!product) continue; // Skip invalid products

        const price = Number(product.price);
        calculatedSubtotal += price * item.quantity;

        sanitizedItems.push({
            ...item,
            name: product.name, // Store name snapshot
            price: price        // Store price snapshot
        });
    }

    if (sanitizedItems.length === 0) return { error: "Panier vide ou invalide" };

    const calculatedTotal = calculatedSubtotal;

    // 4. Insert Order with Trusted Values
    const { data, error } = await supabaseAdmin
        .from("orders")
        .insert({
            store_id: input.store_id,
            customer_email: input.customer_email,
            customer_name: input.customer_name,
            customer_phone: input.customer_phone,
            items: sanitizedItems,
            subtotal: calculatedSubtotal,
            total: calculatedTotal,
            payment_method: input.payment_method,
            shipping_address: input.shipping_address,
            notes: input.notes,
            provider_order_id: input.provider_order_id,
            status: "pending",
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating order:", error);
        return { error: "Failed to create order" };
    }

    // revalidate internal dashboard pages to show new order
    revalidatePath(`/dashboard/${input.store_id}/orders`);
    return { success: true, order: data };
}

export async function updateOrderStatus(orderId: string, status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled") {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non authentifié" };

    // Strict Ownership Check
    // Join orders -> stores to check owner_id
    const { data: order } = await supabase
        .from("orders")
        .select("store_id, stores!inner(owner_id)")
        .eq("id", orderId)
        .single();

    if (!order || (order.stores as any).owner_id !== user.id) {
        return { error: "Accès refusé ou commande introuvable" };
    }

    const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

    if (error) {
        return { error: "Failed to update order status" };
    }

    revalidatePath("/dashboard/[slug]/orders", "page");
    return { success: true };
}
export async function getOrderBySessionId(sessionId: string) {
    if (!sessionId) return { error: "Session ID missing" };

    // Use Admin Client to bypass RLS for success page display
    const { createClient: createAdminClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );

    const { data, error } = await supabaseAdmin
        .from("orders")
        .select(`
            *,
            stores (
                name,
                logo_url,
                address,
                phone,
                email
            )
        `)
        .or(`provider_order_id.eq.${sessionId},notes.ilike.%${sessionId}%`)
        .maybeSingle();

    if (error || !data) {
        console.error("Error fetching order by session id:", error);
        return { error: "Failed to fetch order details" };
    }

    return { order: data };
}
