import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ThemeProvider } from "@/lib/theme-engine/context";
import { StorefrontWrapper } from "@/components/storefront/wrapper";
import { DEFAULT_THEME, ThemeConfig } from "@/lib/theme-engine/types";
import { getProductBySlug, getSimilarProducts } from "@/lib/actions/product";
import { ProductViewer } from "@/components/storefront/product-viewer";
import { ProductGrid } from "@/components/blocks/product-grid";
import { headers } from "next/headers";

interface ProductPageProps {
    params: {
        slug: string;
        productSlug: string;
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
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

    // Fetch the product
    const product = await getProductBySlug(params.slug, params.productSlug);

    if (!product || !product.is_active) {
        notFound();
    }

    // Fetch similar products
    const similarProducts = await getSimilarProducts(store.id, product.id, product.category);

    // Get theme config (with fallback to default)
    const themeConfig: ThemeConfig = store.theme_config || DEFAULT_THEME;

    return (
        <ThemeProvider initialTheme={themeConfig}>
            <StorefrontWrapper store={store} products={[]}>
                <ProductViewer product={product} store={store} />

                {similarProducts.length > 0 && (
                    <div className="border-t border-white/5 bg-black/20">
                        <ProductGrid
                            config={{
                                id: "similar-products",
                                type: "product-grid",
                                props: {
                                    title: "Produits Similaires",
                                    limit: 4,
                                    columns: 4,
                                    showPrice: true
                                }
                            }}
                            products={similarProducts as any}
                            storeSlug={params.slug}
                            isSubdomain={isSubdomain}
                        />
                    </div>
                )}
            </StorefrontWrapper>
        </ThemeProvider>
    );
}

// Generate metadata for SEO & Social Sharing (WhatsApp Magic)
export async function generateMetadata({ params }: ProductPageProps) {
    const product = await getProductBySlug(params.slug, params.productSlug);

    if (!product) {
        return {
            title: "Product Not Found",
        };
    }

    const priceText = `${product.price.toLocaleString('fr-FR')} FCFA`;
    const promoBadge = product.compare_at_price ? ` 🔥 OFFRE SPÉCIALE` : "";

    return {
        title: `${product.name} - ${priceText}${promoBadge}`,
        description: `🚀 Exclusivité Aura : ${product.name} à ${priceText}. Découvrez une expérience e-commerce immersive. Commandez maintenant !`,
        openGraph: {
            title: `${product.name} | ${priceText}${promoBadge}`,
            description: product.description || `Pépite disponible maintenant sur AuraStore.`,
            images: product.images?.[0] ? [
                {
                    url: product.images[0],
                    width: 1200,
                    height: 630,
                    alt: product.name,
                }
            ] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: `Découvrez cet article sur AuraStore !`,
            images: product.images?.[0] ? [product.images[0]] : [],
        },
    };
}
