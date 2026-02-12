import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = createClient();
    const baseUrl = siteConfig.url;

    // 1. Static Routes
    const staticRoutes = [
        '',
        '/login',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.5,
    }));

    // 2. Fetch Active Stores
    const { data: stores } = await supabase
        .from('stores')
        .select('slug, updated_at')
        .eq('is_active', true);

    const storeRoutes = (stores || []).map((store) => ({
        url: `${baseUrl}/store/${store.slug}`,
        lastModified: new Date(store.updated_at || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // 3. Fetch Active Products
    // We join with stores to get the slug for the product URL
    const { data: products } = await supabase
        .from('products')
        .select('slug, updated_at, stores(slug)')
        .eq('is_active', true);

    const productRoutes = (products || []).map((product: any) => ({
        url: `${baseUrl}/store/${product.stores.slug}/products/${product.slug}`,
        lastModified: new Date(product.updated_at || Date.now()),
        changeFrequency: 'daily' as const,
        priority: 0.6,
    }));

    return [...staticRoutes, ...storeRoutes, ...productRoutes];
}
