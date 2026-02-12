import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ThemeProvider } from "@/lib/theme-engine/context";
import { LayoutRenderer } from "@/lib/theme-engine/renderer";
import { DEFAULT_THEME, ThemeConfig } from "@/lib/theme-engine/types";
import { ImageBanner } from "@/components/blocks/image-banner";
import { StorefrontWrapper } from "@/components/storefront/wrapper";

import { getStoreBySlug } from "@/lib/actions/store";
import { getStoreProducts } from "@/lib/actions/product";

interface StorePageProps {
    params: {
        slug: string;
    };
}

export default async function StorePage({ params }: StorePageProps) {
    const headersList = headers();
    const isSubdomain = headersList.get("x-store-slug") === params.slug;

    // Fetch store by slug using cached action
    const store = await getStoreBySlug(params.slug);

    if (!store || !store.is_active) {
        notFound();
    }

    // Fetch products for this store using cached action
    const products = await getStoreProducts(store.id);

    // Get theme config (with fallback to default)
    const themeConfig: ThemeConfig = store.theme_config || DEFAULT_THEME;

    return (
        <ThemeProvider initialTheme={themeConfig}>
            <StorefrontWrapper store={store} products={products || []}>
                {/* Immersive Store Profile/Banner Section */}
                <ImageBanner
                    store={store}
                    config={{
                        id: "store-banner",
                        type: "image_banner",
                        props: { backgroundImage: store.banner_url }
                    }}
                />

                <LayoutRenderer
                    layout={themeConfig.layout_home}
                    products={products || []}
                    storeSlug={params.slug}
                    isSubdomain={isSubdomain}
                />
            </StorefrontWrapper>
        </ThemeProvider>
    );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: StorePageProps) {
    const supabase = createClient();

    const { data: store } = await supabase
        .from("stores")
        .select("name, description, logo_url, banner_url")
        .eq("slug", params.slug)
        .maybeSingle();

    if (!store) {
        return {
            title: "Boutique Introuvable",
        };
    }

    const images = [];
    if (store.banner_url) images.push({ url: store.banner_url, width: 1200, height: 630, alt: store.name });
    if (store.logo_url) images.push({ url: store.logo_url, width: 400, height: 400, alt: `${store.name} Logo` });

    return {
        title: store.name,
        description: store.description || `Découvrez l'univers de ${store.name} sur AuraStore.`,
        openGraph: {
            title: store.name,
            description: store.description || `Découvrez l'univers de ${store.name} sur AuraStore.`,
            images,
            type: 'website',
            siteName: "AuraStore",
        },
        twitter: {
            card: "summary_large_image",
            title: store.name,
            description: store.description || `Découvrez l'univers de ${store.name} sur AuraStore.`,
            images: images.length > 0 ? [images[0].url] : [],
        }
    };
}
