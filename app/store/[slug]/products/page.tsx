import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ThemeProvider } from "@/lib/theme-engine/context";
import { StorefrontWrapper } from "@/components/storefront/wrapper";
import { DEFAULT_THEME, ThemeConfig } from "@/lib/theme-engine/types";
import { ProductGrid } from "@/components/blocks/product-grid";

interface ProductsPageProps {
    params: {
        slug: string;
    };
}

export default async function ProductsPage({ params }: ProductsPageProps) {
    const supabase = createClient();
    const headersList = headers();
    const isSubdomain = headersList.get("x-store-slug") === params.slug;

    // Fetch store by slug
    const { data: store, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", params.slug)
        .eq("is_active", true)
        .single();

    if (storeError || !store) {
        notFound();
    }

    // Fetch all active products for this store
    const { data: products } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", store.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

    // Get theme config
    const themeConfig: ThemeConfig = store.theme_config || DEFAULT_THEME;

    return (
        <ThemeProvider initialTheme={themeConfig}>
            <StorefrontWrapper store={store} products={products || []}>
                <div className="pt-32 pb-24 px-6 md:px-12">
                    <div className="max-w-7xl mx-auto space-y-16">
                        {/* Header Section */}
                        <div className="space-y-6">
                            <h1 className="font-display text-5xl md:text-7xl font-black text-white tracking-tighter">
                                Nos <span className="text-secondary">Produits</span>
                            </h1>
                            <p className="text-white/40 text-lg max-w-2xl font-medium">
                                Découvrez notre collection exclusive d'assets premium conçus pour élever votre style.
                            </p>
                        </div>

                        {/* Product Grid */}
                        <div className="-mx-4 md:-mx-8">
                            <ProductGrid
                                config={{
                                    id: "all-products-grid",
                                    type: "product_grid",
                                    props: {
                                        title: "", // No title as we have a header above
                                        limit: 24,
                                        columns: 4,
                                        showPrice: true
                                    }
                                }}
                                products={products || []}
                                storeSlug={params.slug}
                                isSubdomain={isSubdomain}
                            />
                        </div>
                    </div>
                </div>
            </StorefrontWrapper>
        </ThemeProvider>
    );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductsPageProps) {
    const supabase = createClient();
    const { data: store } = await supabase
        .from("stores")
        .select("name")
        .eq("slug", params.slug)
        .single();

    return {
        title: `Tous les produits | ${store?.name || params.slug}`,
        description: `Explorez le catalogue complet de ${store?.name || params.slug}. Des produits premium sélectionnés pour vous.`,
    };
}
