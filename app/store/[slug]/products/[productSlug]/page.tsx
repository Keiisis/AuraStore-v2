import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ThemeProvider } from "@/lib/theme-engine/context";
import { StorefrontWrapper } from "@/components/storefront/wrapper";
import { DEFAULT_THEME, ThemeConfig } from "@/lib/theme-engine/types";
import { getProductBySlug, getSimilarProducts } from "@/lib/actions/product";
import { getStoreBySlug } from "@/lib/actions/store";
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
    const headersList = headers();
    const isSubdomain = headersList.get("x-store-slug") === params.slug;

    // Fetch store by slug using cached action
    const store = await getStoreBySlug(params.slug);

    if (!store || !store.is_active) {
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

    // JSON-LD for Google Rich Snippets
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.images || [],
        "description": product.description,
        "sku": product.id,
        "offers": {
            "@type": "Offer",
            "url": `${process.env.NEXT_PUBLIC_APP_URL}/store/${params.slug}/products/${params.productSlug}`,
            "priceCurrency": "XOF",
            "price": product.price,
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
                "@type": "Organization",
                "name": store.name
            }
        }
    };

    return (
        <ThemeProvider initialTheme={themeConfig}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
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

// Generate metadata for SEO & Social Sharing
export async function generateMetadata({ params }: ProductPageProps) {
    const [product, store] = await Promise.all([
        getProductBySlug(params.slug, params.productSlug),
        getStoreBySlug(params.slug)
    ]);

    if (!product || !store) {
        return {
            title: "Produit Introuvable",
        };
    }

    const priceText = `${product.price.toLocaleString('fr-FR')} FCFA`;
    const promoBadge = product.compare_at_price ? ` 🔥 OFFRE` : "";
    const storeName = store.name || "Aura Store";

    return {
        title: `${product.name} - ${priceText} | ${storeName}`,
        description: product.description?.slice(0, 160) || `Découvrez ${product.name} sur la boutique ${storeName}. Disponible maintenant !`,
        openGraph: {
            title: `${product.name} - ${priceText}${promoBadge}`,
            description: `En vente sur ${storeName}. Cliquez pour voir les détails.`,
            siteName: storeName,
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
            title: `${product.name} | ${storeName}`,
            description: `Disponible maintenant : ${product.name}`,
            images: product.images?.[0] ? [product.images[0]] : [],
        },
    };
}
