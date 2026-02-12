import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/dashboard/product-form";

interface EditProductPageProps {
    params: {
        slug: string;
        productId: string;
    };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { slug, productId } = params;
    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get store details (to verify ownership)
    const { data: store } = await supabase
        .from("stores")
        .select("id")
        .eq("slug", slug)
        .eq("owner_id", user.id)
        .single();

    if (!store) {
        notFound();
    }

    // Get product details
    const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("store_id", store.id)
        .single();

    if (!product) {
        notFound();
    }

    return (
        <div className="pt-16">
            <ProductForm
                storeId={store.id}
                storeSlug={slug}
                initialData={product as any}
            />
        </div>
    );
}
