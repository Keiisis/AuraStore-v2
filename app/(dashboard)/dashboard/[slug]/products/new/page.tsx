import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/dashboard/product-form";

interface NewProductPageProps {
    params: {
        slug: string;
    };
}

export default async function NewProductPage({ params }: NewProductPageProps) {
    const { slug } = params;
    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get store details
    const { data: store } = await supabase
        .from("stores")
        .select("id, name")
        .eq("slug", slug)
        .eq("owner_id", user.id)
        .single();

    if (!store) {
        notFound();
    }

    return (
        <div className="pt-6">
            <ProductForm storeId={store.id} storeSlug={slug} />
        </div>
    );
}
