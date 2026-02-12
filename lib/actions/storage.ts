"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadImage(formData: FormData, bucket: string = "store-assets") {
    const supabase = createClient();
    const file = formData.get("file") as File;

    if (!file) {
        return { error: "No file provided" };
    }

    // Get current user for the path
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Authentication required" };
    }

    // Security Validation
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

    if (file.size > MAX_SIZE) {
        return { error: "File too large (Max 5MB)" };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        return { error: "Invalid file type. Only images allowed." };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = fileName;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            upsert: true,
            contentType: file.type,
        });

    if (error) {
        console.error("Upload error:", error);
        return { error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return { success: true, url: publicUrl };
}
