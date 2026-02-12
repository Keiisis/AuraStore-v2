import { createClient } from "@/lib/supabase/server";
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

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get store details
    const { data: store, error } = await supabase
        .from("stores")
        .select("id, name")
        .eq("slug", slug)
        .eq("owner_id", user.id)
        .maybeSingle();

    if (error) {
        console.error("Store Fetch Error:", error);
    }

    if (!store) {
        notFound();
    }

    // Get products
    const products = await getStoreProducts(store.id);

    return (
        <div className="space-y-6 scale-[0.98] transform-gpu">
            <ProductTableClient
                products={products}
                storeSlug={slug}
                storeId={store.id}
            />
        </div>
    );
}
