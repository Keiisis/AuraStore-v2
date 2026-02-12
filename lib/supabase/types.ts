export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

// Theme Configuration Types
export interface ThemeTokens {
    primary: string;
    secondary?: string;
    accent?: string;
    font: string;
    radius: string;
    background?: string;
}

export interface BlockProps {
    [key: string]: unknown;
}

export interface LayoutBlock {
    id: string;
    type: string;
    props: BlockProps;
}

export interface ThemeConfig {
    tokens: ThemeTokens;
    layout_home: LayoutBlock[];
    layout_product?: LayoutBlock[];
}

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    full_name: string | null;
                    email: string | null;
                    avatar_url: string | null;
                    created_at: string;
                    updated_at: string | null;
                    role: "admin" | "seller" | "customer";
                };
                Insert: {
                    id: string;
                    full_name?: string | null;
                    email?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string | null;
                    role?: "admin" | "seller" | "customer";
                };
                Update: {
                    id?: string;
                    full_name?: string | null;
                    email?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string | null;
                    role?: "admin" | "seller" | "customer";
                };
                Relationships: [];
            };
            stores: {
                Row: {
                    id: string;
                    owner_id: string;
                    name: string;
                    slug: string;
                    custom_domain: string | null;
                    description: string | null;
                    whatsapp_number: string | null;
                    logo_url: string | null;
                    banner_url: string | null;
                    theme_config: ThemeConfig;
                    payment_config: Json | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    owner_id: string;
                    name: string;
                    slug: string;
                    custom_domain?: string | null;
                    description?: string | null;
                    whatsapp_number?: string | null;
                    logo_url?: string | null;
                    banner_url?: string | null;
                    theme_config?: ThemeConfig;
                    payment_config?: Json | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    owner_id?: string;
                    name?: string;
                    slug?: string;
                    custom_domain?: string | null;
                    description?: string | null;
                    whatsapp_number?: string | null;
                    logo_url?: string | null;
                    banner_url?: string | null;
                    theme_config?: ThemeConfig;
                    payment_config?: Json | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "stores_owner_id_fkey";
                        columns: ["owner_id"];
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            products: {
                Row: {
                    id: string;
                    store_id: string;
                    name: string;
                    slug: string;
                    description: string | null;
                    price: number;
                    compare_at_price: number | null;
                    images: string[];
                    category: string | null;
                    tags: string[];
                    attributes: Json;
                    vto_enabled: boolean;
                    glb_url: string | null;
                    stock: number;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    store_id: string;
                    name: string;
                    slug: string;
                    description?: string | null;
                    price: number;
                    compare_at_price?: number | null;
                    images?: string[];
                    category?: string | null;
                    tags?: string[];
                    attributes?: Json;
                    vto_enabled?: boolean;
                    stock?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    store_id?: string;
                    name?: string;
                    slug?: string;
                    description?: string | null;
                    price?: number;
                    compare_at_price?: number | null;
                    images?: string[];
                    category?: string | null;
                    tags?: string[];
                    attributes?: Json;
                    vto_enabled?: boolean;
                    stock?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "products_store_id_fkey";
                        columns: ["store_id"];
                        referencedRelation: "stores";
                        referencedColumns: ["id"];
                    }
                ];
            };
            orders: {
                Row: {
                    id: string;
                    store_id: string;
                    customer_email: string;
                    customer_name: string;
                    customer_phone: string | null;
                    items: Json;
                    subtotal: number;
                    total: number;
                    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
                    payment_method: "whatsapp" | "stripe" | "cash" | "paypal" | "flutterwave" | "fedapay" | "kkiapay";
                    shipping_address: Json | null;
                    notes: string | null;
                    created_at: string;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    store_id: string;
                    customer_email: string;
                    customer_name: string;
                    customer_phone?: string | null;
                    items: Json;
                    subtotal: number;
                    total: number;
                    status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
                    payment_method: "whatsapp" | "stripe" | "cash" | "paypal" | "flutterwave" | "fedapay" | "kkiapay";
                    shipping_address?: Json | null;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    store_id?: string;
                    customer_email?: string;
                    customer_name?: string;
                    customer_phone?: string | null;
                    items?: Json;
                    subtotal?: number;
                    total?: number;
                    status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
                    payment_method?: "whatsapp" | "stripe" | "cash";
                    shipping_address?: Json | null;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string | null;
                };
                ];
            };
            vto_leads: {
                Row: {
                    id: string;
                    store_id: string;
                    product_id: string | null;
                    customer_name: string;
                    customer_whatsapp: string;
                    user_photo_url: string | null;
                    result_photo_url: string | null;
                    status: string | null;
                    created_at: string;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    store_id: string;
                    product_id?: string | null;
                    customer_name: string;
                    customer_whatsapp: string;
                    user_photo_url?: string | null;
                    result_photo_url?: string | null;
                    status?: string | null;
                    created_at?: string;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    store_id?: string;
                    product_id?: string | null;
                    customer_name?: string;
                    customer_whatsapp?: string;
                    user_photo_url?: string | null;
                    result_photo_url?: string | null;
                    status?: string | null;
                    created_at?: string;
                    updated_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "vto_leads_store_id_fkey";
                        columns: ["store_id"];
                        referencedRelation: "stores";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "vto_leads_product_id_fkey";
                        columns: ["product_id"];
                        referencedRelation: "products";
                        referencedColumns: ["id"];
                    }
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            get_store_by_domain: {
                Args: { domain_input: string };
                Returns: Database["public"]["Tables"]["stores"]["Row"] | null;
            };
            get_user_plan_limits: {
                Args: { p_user_id: string };
                Returns: Json;
            };
        };
        Enums: {
            order_status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
            payment_method: "whatsapp" | "stripe" | "cash" | "paypal" | "flutterwave" | "fedapay" | "kkiapay" | "orange_money" | "crypto";
            subscription_status: "active" | "trial" | "past_due" | "cancelled" | "expired";
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}

// Helper types for easier usage
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Store = Database["public"]["Tables"]["stores"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];

export type InsertProfile = Database["public"]["Tables"]["profiles"]["Insert"];
export type InsertStore = Database["public"]["Tables"]["stores"]["Insert"];
export type InsertProduct = Database["public"]["Tables"]["products"]["Insert"];
export type InsertOrder = Database["public"]["Tables"]["orders"]["Insert"];

export type UpdateProfile = Database["public"]["Tables"]["profiles"]["Update"];
export type UpdateStore = Database["public"]["Tables"]["stores"]["Update"];
export type UpdateProduct = Database["public"]["Tables"]["products"]["Update"];
export type UpdateOrder = Database["public"]["Tables"]["orders"]["Update"];
