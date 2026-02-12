import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { MarketingClient } from "@/components/dashboard/marketing-client";

export default async function MarketingPage({ params }: { params: { slug: string } }) {
    const supabase = createClient();
    const { slug } = params;

    // Get store
    const { data: store } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", slug)
        .single();

    if (!store) notFound();

    // Get leads for this store
    const { data: leads } = await supabase
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
