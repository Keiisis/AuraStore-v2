import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = createClient();
    const { data: themes, error } = await supabase
        .from("store_themes")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ themes: themes || [] });
}

async function checkAdmin(supabase: any) {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return false;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    return profile?.role === "admin";
}

export async function POST(req: Request) {
    const supabase = createClient();
    if (!await checkAdmin(supabase)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { data, error } = await supabase.from("store_themes").insert(body).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ theme: data });
}

export async function PUT(req: Request) {
    const supabase = createClient();
    if (!await checkAdmin(supabase)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { id, ...updates } = body;
    const { data, error } = await supabase.from("store_themes").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ theme: data });
}

export async function DELETE(req: Request) {
    const supabase = createClient();
    if (!await checkAdmin(supabase)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase.from("store_themes").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
}
