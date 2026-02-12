import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { getStoreProducts } from "@/lib/actions/product";
import { ProductTableClient } from "@/components/dashboard/product-table-client";

interface ProductsPageProps {
    params: {
        slug: string;
    };
}

export default async function ProductsPage({ params }: ProductsPageProps) {
    const { slug } = params;
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Use Admin Client to bypass RLS for dashboard operations
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
    );

    // Get store details via Admin Client
    const { data: store } = await supabaseAdmin
        .from("stores")
        .select("id, name")
        .eq("slug", slug)
        .eq("owner_id", user.id)
        .maybeSingle();

    if (!store) {
        notFound();
    }

    // Get products via Admin Client (bypass RLS for dashboard)
    const { data: products } = await supabaseAdmin
        .from("products")
        .select("*")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6 scale-[0.98] transform-gpu">
            <ProductTableClient
                products={products || []}
                storeSlug={slug}
                storeId={store.id}
            />
        </div>
    );
}
