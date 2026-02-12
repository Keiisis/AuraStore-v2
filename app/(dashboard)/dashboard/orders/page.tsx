import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export default async function OrdersRedirect() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Use Admin Client
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
    );

    const { data: stores } = await supabaseAdmin
        .from("stores")
        .select("slug")
        .eq("owner_id", user.id)
        .limit(1);

    if (stores && stores.length > 0) {
        redirect(`/dashboard/${stores[0].slug}/orders`);
    } else {
        redirect("/dashboard/new-store");
    }
}
