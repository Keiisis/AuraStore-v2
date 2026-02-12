"use server";

import { revalidatePath, unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { InsertProduct, UpdateProduct } from "@/lib/supabase/types";

// Validation schemas
const createProductSchema = z.object({
    store_id: z.string().uuid(),
    name: z.string().min(2, "Product name must be at least 2 characters"),
    slug: z
        .string()
        .min(2, "Slug must be at least 2 characters")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    description: z.string().optional(),
    price: z.number().positive("Price must be positive"),
    compare_at_price: z.number().positive().optional().nullable(),
    images: z.array(z.string().url()).optional(),
    category: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(),
    stock: z.number().int().min(0).optional(),
    vto_enabled: z.boolean().optional(),
    glb_url: z.string().url().optional().nullable(),
    attributes: z.record(z.any()).optional(),
});

const updateProductSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    price: z.number().positive().optional(),
    compare_at_price: z.number().positive().optional().nullable(),
    images: z.array(z.string().url()).optional(),
    category: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(),
    stock: z.number().int().min(0).optional(),
    vto_enabled: z.boolean().optional(),
    glb_url: z.string().url().optional().nullable(),
    is_active: z.boolean().optional(),
    attributes: z.record(z.any()).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// Create a new product
export async function createProduct(input: CreateProductInput) {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "You must be logged in to create a product" };
    }

    // Validate input
    const validatedFields = createProductSchema.safeParse(input);
    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    const data = validatedFields.data;

    // Verify store ownership
    const { data: store } = await supabase
        .from("stores")
        .select("owner_id, slug")
        .eq("id", data.store_id)
        .single();

    if (!store || store.owner_id !== user.id) {
        return { error: "Store not found or you don't have permission" };
    }

    // Check if slug is unique within the store
    const { data: existingProduct } = await supabase
        .from("products")
        .select("id")
        .eq("store_id", data.store_id)
        .eq("slug", data.slug)
        .single();

    if (existingProduct) {
        return { error: "A product with this slug already exists in your store" };
    }

    // Create the product
    const productData: InsertProduct = {
        store_id: data.store_id,
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        price: data.price,
        compare_at_price: data.compare_at_price || null,
        images: data.images || [],
        category: data.category || null,
        tags: data.tags || [],
        stock: data.stock ?? 0,
        vto_enabled: data.vto_enabled ?? false,
        glb_url: data.glb_url || null,
        attributes: data.attributes || {},
        is_active: true,
    };

    const { data: product, error } = await supabase
        .from("products")
        .insert(productData)
        .select()
        .single();

    if (error) {
        console.error("Error creating product:", error);
        return { error: "Failed to create product. Please try again." };
    }

    revalidatePath(`/dashboard/${store.slug}/products`);
    return { success: true, product };
}

// Update an existing product
export async function updateProduct(input: UpdateProductInput) {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "You must be logged in to update a product" };
    }

    // Validate input
    const validatedFields = updateProductSchema.safeParse(input);
    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { id, ...updateData } = validatedFields.data;

    // Get product and verify ownership
    const { data: product } = await supabase
        .from("products")
        .select("store_id, stores(owner_id, slug)")
        .eq("id", id)
        .single();

    if (!product || (product.stores as any)?.owner_id !== user.id) {
        return { error: "Product not found or you don't have permission" };
    }

    // Update the product
    const { error } = await supabase
        .from("products")
        .update(updateData as UpdateProduct)
        .eq("id", id);

    if (error) {
        console.error("Error updating product:", error);
        return { error: "Failed to update product. Please try again." };
    }

    revalidatePath(`/dashboard/${(product.stores as any)?.slug}/products`);
    return { success: true };
}

// Delete a product
export async function deleteProduct(productId: string) {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "You must be logged in to delete a product" };
    }

    // Get product and verify ownership
    const { data: product } = await supabase
        .from("products")
        .select("store_id, stores(owner_id, slug)")
        .eq("id", productId)
        .single();

    if (!product || (product.stores as any)?.owner_id !== user.id) {
        return { error: "Product not found or you don't have permission" };
    }

    // 4. CLEANUP: Delete images from Storage (Cost Optimization)
    if (product.images && product.images.length > 0) {
        const filePaths = product.images.map((url: string) => {
            // Extract path from URL: .../storage/v1/object/public/store-assets/PATH
            try {
                const urlObj = new URL(url);
                const pathParts = urlObj.pathname.split("/store-assets/");
                return pathParts.length > 1 ? pathParts[1] : null;
            } catch (e) {
                return null;
            }
        }).filter((p: any) => p !== null) as string[];

        if (filePaths.length > 0) {
            await supabase.storage.from("store-assets").remove(filePaths);
        }
    }

    // Delete the product
    const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

    if (error) {
        console.error("Error deleting product:", error);
        return { error: "Failed to delete product. Please try again." };
    }

    revalidatePath(`/dashboard/${(product.stores as any)?.slug}/products`);
    return { success: true };
}

// Get products for a store
export const getStoreProducts = unstable_cache(
    async (storeId: string) => {
        const supabase = createClient();

        const { data: products, error } = await supabase
            .from("products")
            .select("*")
            .eq("store_id", storeId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching products:", error);
            return [];
        }

        return products;
    },
    ["store-products"],
    {
        revalidate: 3600,
        tags: ["products"]
    }
);

// Generate slug from name
export async function generateSlug(name: string): Promise<string> {
    const base = name || "";
    return base
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// Get product by slug and store slug
export const getProductBySlug = unstable_cache(
    async (storeSlug: string, productSlug: string) => {
        const supabase = createClient();

        const { data: store } = await supabase
            .from("stores")
            .select("id")
            .eq("slug", storeSlug)
            .single();

        if (!store) return null;

        const { data: product } = await supabase
            .from("products")
            .select("*")
            .eq("store_id", store.id)
            .eq("slug", productSlug)
            .single();

        return product;
    },
    ["product-by-slug"],
    { revalidate: 3600, tags: ["products"] }
);

// Get similar products based on category
export const getSimilarProducts = unstable_cache(
    async (storeId: string, currentProductId: string, category: string | null, limit: number = 4) => {
        const supabase = createClient();

        let query = supabase
            .from("products")
            .select("*")
            .eq("store_id", storeId)
            .eq("is_active", true)
            .neq("id", currentProductId);

        if (category) {
            query = query.eq("category", category);
        }

        const { data: products } = await query.limit(limit);

        return products || [];
    },
    ["similar-products"],
    { revalidate: 3600, tags: ["products"] }
);
