import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ThemeProvider } from "@/lib/theme-engine/context";
import { LayoutRenderer } from "@/lib/theme-engine/renderer";
import { DEFAULT_THEME, ThemeConfig } from "@/lib/theme-engine/types";
import { ImageBanner } from "@/components/blocks/image-banner";
import { StorefrontWrapper } from "@/components/storefront/wrapper";

interface StorePageProps {
    params: {
        slug: string;
    };
}

export default async function StorePage({ params }: StorePageProps) {
    const supabase = createClient();
    const headersList = headers();
    const isSubdomain = headersList.get("x-store-slug") === params.slug;

    // Fetch store by slug
    const { data: store, error } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", params.slug)
        .eq("is_active", true)
        .single();

    if (error || !store) {
        notFound();
    }

    // Fetch products for this store
    const { data: products } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", store.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

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
        .select("name, description")
        .eq("slug", params.slug)
        .single();

    if (!store) {
        return {
            title: "Store Not Found",
        };
    }

    return {
        title: store.name,
        description: store.description || `Welcome to ${store.name}`,
    };
}
