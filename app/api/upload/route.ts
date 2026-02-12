import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    const supabase = createClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

        // Generate unique path
        const fileExt = file.name.split(".").pop();
        const fileName = `brand-logo-${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        // Upload to 'brand-assets' bucket
        const { error: uploadError } = await supabase.storage
            .from("brand-assets")
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false
            });

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from("brand-assets")
            .getPublicUrl(filePath);

        return NextResponse.json({ url: publicUrl });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
