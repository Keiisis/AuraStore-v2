import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
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

    // Use Admin Client
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
    );

    // Get store details via Admin
    const { data: store } = await supabaseAdmin
        .from("stores")
        .select("id, name, theme_config")
        .eq("slug", slug)
        .eq("owner_id", user.id)
        .maybeSingle();

    if (!store) {
        notFound();
    }

    // Get store products via Admin
    const { data: products } = await supabaseAdmin
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
