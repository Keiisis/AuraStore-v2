import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ImagenLab } from "@/components/dashboard/imagen-lab";

export default async function ImagenPage({ params }: { params: { slug: string } }) {
    const supabase = createClient();
    const { slug } = params;

    // Get store
    const { data: store } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", slug)
        .single();

    if (!store) notFound();

    return (
        <div className="p-4 md:p-8">
            <ImagenLab storeId={store.id} />
        </div>
    );
}
