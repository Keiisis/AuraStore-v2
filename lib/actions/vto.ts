"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

const vtoLeadSchema = z.object({
    store_id: z.string().uuid(),
    product_id: z.string().uuid(),
    customer_name: z.string().min(2),
    customer_whatsapp: z.string().min(8),
    user_photo_url: z.string(), // Base64 or URL
});

export async function createVtoLead(input: z.infer<typeof vtoLeadSchema>) {
    try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        );

        const { data, error } = await supabaseAdmin
            .from("vto_leads")
            .insert({
                store_id: input.store_id,
                product_id: input.product_id,
                customer_name: input.customer_name,
                customer_whatsapp: input.customer_whatsapp,
                user_photo_url: input.user_photo_url,
                status: 'new'
            })
            .select()
            .single();

        if (error) {
            console.error("VTO Lead Error:", error);
            return { error: "Échec de l'enregistrement de l'essayage." };
        }

        revalidatePath(`/dashboard/${input.store_id}/leads`);
        return { success: true, lead: data };
    } catch (e) {
        console.error("VTO Lead Action Error:", e);
        return { error: "Service momentanément indisponible." };
    }
}

export async function updateVtoLeadResult(leadId: string, resultImageUrl: string) {
    try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        );

        const { error } = await supabaseAdmin
            .from("vto_leads")
            .update({ result_photo_url: resultImageUrl, status: 'processed' })
            .eq("id", leadId);

        if (error) throw error;
        return { success: true };
    } catch (e) {
        console.error("VTO Update Error:", e);
        return { error: "Échec de la mise à jour du résultat." };
    }
}
