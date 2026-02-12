import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { MarketingClient } from "@/components/dashboard/marketing-client";

export default async function MarketingPage({ params }: { params: { slug: string } }) {
    const supabase = createClient();
    const { slug } = params;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Use Admin Client to bypass RLS
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
    );

    // Get store via Admin
    const { data: store } = await supabaseAdmin
        .from("stores")
        .select("*")
        .eq("slug", slug)
        .eq("owner_id", user.id)
        .maybeSingle();

    if (!store) notFound();

    // Get leads for this store via Admin
    const { data: leads } = await supabaseAdmin
        .from("vto_leads")
        .select(`
            *,
            products(name, images)
        `)
        .eq("store_id", store.id)
        .order("created_at", { ascending: false });

    return (
        <div className="p-4 md:p-8">
            <MarketingClient
                storeId={store.id}
                initialLeads={leads || []}
                whatsappNumber={store.whatsapp_number || ""}
            />
        </div>
    );
}
