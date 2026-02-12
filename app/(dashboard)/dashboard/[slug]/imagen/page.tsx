import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { ImagenLab } from "@/components/dashboard/imagen-lab";

export default async function ImagenPage({ params }: { params: { slug: string } }) {
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

    return (
        <div className="p-4 md:p-8">
            <ImagenLab storeId={store.id} />
        </div>
    );
}
