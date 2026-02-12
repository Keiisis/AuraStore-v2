import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ThemeEditor } from "@/components/dashboard/theme-editor";
import { DEFAULT_THEME } from "@/lib/theme-engine/types";

interface EditorPageProps {
    params: {
        slug: string;
    };
}

export default async function EditorPage({ params }: EditorPageProps) {
    const { slug } = params;
    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get store details
    const { data: store } = await supabase
        .from("stores")
        .select("id, name, theme_config")
        .eq("slug", slug)
        .eq("owner_id", user.id)
        .single();

    if (!store) {
        notFound();
    }

    // Get store products
    const { data: products } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false });

    // Ensure initialTheme is properly typed before passing
    const initialTheme = (store.theme_config as any) || DEFAULT_THEME;

    return (
        <ThemeEditor
            storeId={store.id}
            storeSlug={slug}
            initialTheme={initialTheme}
            products={(products as any[]) || []}
        />
    );
}
