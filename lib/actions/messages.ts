"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAdminMessages(otherUserId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non autorisé", messages: [] };

    const { data, error } = await supabase
        .from("admin_messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

    if (error) return { error: error.message, messages: [] };
    return { messages: data || [] };
}

export async function sendAdminMessage(receiverId: string, content: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non autorisé" };

    const { error } = await supabase
        .from("admin_messages")
        .insert({
            sender_id: user.id,
            receiver_id: receiverId,
            content,
            status: 'sent'
        });

    if (error) return { error: error.message };

    revalidatePath("/admin/users");
    return { success: true };
}

export async function markMessagesAsRead(senderId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non autorisé" };

    const { error } = await supabase
        .from("admin_messages")
        .update({
            status: 'read',
            read_at: new Date().toISOString()
        })
        .match({
            sender_id: senderId,
            receiver_id: user.id
        })
        .neq('status', 'read');

    if (error) return { error: error.message };
    return { success: true };
}
