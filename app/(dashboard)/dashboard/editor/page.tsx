import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function EditorRedirect() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: stores } = await supabase
        .from("stores")
        .select("slug")
        .eq("owner_id", user.id)
        .limit(1);

    if (stores && stores.length > 0) {
        redirect(`/dashboard/${stores[0].slug}/editor`);
    } else {
        redirect("/dashboard/new-store");
    }
}
