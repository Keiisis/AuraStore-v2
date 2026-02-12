import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/actions/product";
import { getStoreBySlug } from "@/lib/actions/store";

export const runtime = "edge";
export const alt = "Aura Store Preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string; productSlug: string } }) {
    try {
        const [product, store] = await Promise.all([
            getProductBySlug(params.slug, params.productSlug),
            getStoreBySlug(params.slug)
        ]);

        if (!product || !store) throw new Error("Not found");

        const storeName = store.name || "Aura Store";
        const price = `${product.price.toLocaleString("fr-FR")} FCFA`;
        const productImage = product.images?.[0];

        return new ImageResponse(
            (
                <div style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    backgroundColor: '#050505',
                    color: 'white',
                    fontFamily: 'sans-serif',
                }}>
                    {/* Left Side: Info */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '55%',
                        height: '100%',
                        padding: '60px',
                        justifyContent: 'center',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                            <div style={{ width: '40px', height: '6px', backgroundColor: '#FE7501', borderRadius: '3px' }} />
                            <div style={{ fontSize: '28px', fontWeight: 800, color: '#FE7501', textTransform: 'uppercase', letterSpacing: '4px' }}>
                                {storeName}
                            </div>
                        </div>

                        <div style={{ fontSize: '80px', fontWeight: 900, lineHeight: 1, marginBottom: '40px', color: 'white' }}>
                            {product.name}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '60px', fontWeight: 800, color: 'white' }}>
                                {price}
                            </div>
                            {product.compare_at_price && (
                                <div style={{ fontSize: '32px', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>
                                    {product.compare_at_price.toLocaleString("fr-FR")} FCFA
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Product Image with Aura Glow */}
                    <div style={{
                        display: 'flex',
                        width: '45%',
                        height: '100%',
                        position: 'relative',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        {/* Orange Aura Glow Behind Image */}
                        <div style={{
                            position: 'absolute',
                            width: '400px',
                            height: '400px',
                            backgroundColor: '#FE7501',
                            borderRadius: '50%',
                            opacity: 0.15,
                            filter: 'blur(100px)',
                        }} />

                        {productImage && (
                            <img
                                src={productImage}
                                alt={product.name}
                                style={{
                                    width: '85%',
                                    height: '85%',
                                    objectFit: 'contain',
                                    borderRadius: '24px',
                                }}
                            />
                        )}
                    </div>

                    {/* Branding Bottom Right */}
                    <div style={{
                        position: 'absolute',
                        bottom: '40px',
                        right: '40px',
                        fontSize: '14px',
                        fontWeight: 900,
                        color: 'rgba(255,255,255,0.1)',
                        textTransform: 'uppercase',
                        letterSpacing: '5px',
                    }}>
                        AURASTORE TECHNOLOGIES
                    </div>
                </div>
            ),
            { ...size }
        );
    } catch (e) {
        return new ImageResponse(
            (
                <div style={{ background: 'black', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'white', fontSize: 40 }}>
                    Aura Store | {params.productSlug}
                </div>
            ),
            { ...size }
        );
    }
}
