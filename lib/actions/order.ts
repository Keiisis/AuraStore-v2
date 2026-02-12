"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createOrderSchema = z.object({
    store_id: z.string().uuid(),
    customer_email: z.string().email(),
    customer_name: z.string().min(2),
    customer_phone: z.string().optional().nullable(),
    items: z.any(),
    subtotal: z.number(),
    total: z.number(),
    payment_method: z.enum(["whatsapp", "stripe", "cash", "paypal", "flutterwave", "fedapay", "kkiapay"]),
    shipping_address: z.any().optional().nullable(),
    notes: z.string().optional().nullable(),
});

export async function createOrder(input: z.infer<typeof createOrderSchema>) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("orders")
        .insert({
            ...input,
            status: "pending",
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating order:", error);
        return { error: "Failed to create order" };
    }

    // revalidate internal dashboard pages to show new order
    revalidatePath("/dashboard/[slug]/orders", "page");
    revalidatePath("/dashboard/[slug]/analytics", "page");

    return { success: true, order: data };
}

export async function updateOrderStatus(orderId: string, status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled") {
    const supabase = createClient();

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
    const supabase = createClient();

    const { data, error } = await supabase
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
        .ilike("notes", `%${sessionId}%`)
        .single();

    if (error) {
        console.error("Error fetching order by session id:", error);
        return { error: "Failed to fetch order details" };
    }

    return { order: data };
}
