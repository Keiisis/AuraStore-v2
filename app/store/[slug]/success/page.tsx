import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/actions/store";
import { StorefrontWrapper } from "@/components/storefront/wrapper";
import { ThemeProvider } from "@/lib/theme-engine/context";
import { DEFAULT_THEME } from "@/lib/theme-engine/types";
import { SuccessClient } from "./success-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SuccessPageProps {
    params: {
        slug: string;
    };
    searchParams: {
        session_id?: string;
    };
}

export default async function SuccessPage({ params, searchParams }: SuccessPageProps) {
    const store = await getStoreBySlug(params.slug);

    if (!store) {
        notFound();
    }

    const themeConfig = store.theme_config || DEFAULT_THEME;

    return (
        <ThemeProvider initialTheme={themeConfig}>
            <StorefrontWrapper store={store} products={[]}>
                <SuccessClient
                    sessionId={Array.isArray(searchParams.session_id) ? searchParams.session_id[0] : searchParams.session_id}
                    storeName={store.name}
                />
            </StorefrontWrapper>
        </ThemeProvider>
    );
}
