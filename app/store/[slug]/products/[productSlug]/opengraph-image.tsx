import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/actions/product";
import { getStoreBySlug } from "@/lib/actions/store";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Aperçu du Produit";
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string; productSlug: string } }) {
    // Fetch data
    const [product, store] = await Promise.all([
        getProductBySlug(params.slug, params.productSlug),
        getStoreBySlug(params.slug)
    ]);

    if (!product || !store) {
        return new ImageResponse(
            (
                <div style={{
                    fontSize: 40,
                    color: 'white',
                    background: 'black',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    Produit Introuvable
                </div>
            ),
            { ...size }
        );
    }

    const price = `${product.price.toLocaleString("fr-FR")} FCFA`;
    const comparePrice = product.compare_at_price ? `${product.compare_at_price.toLocaleString("fr-FR")} FCFA` : null;
    const storeName = store.name || "Aura Store";
    const bgImage = product.images?.[0]; // URL of the product image
    const hasPromo = !!comparePrice;

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    backgroundColor: '#050505',
                    backgroundImage: bgImage ? `url(${bgImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Gradient Overlay for Readability */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '70%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0))',
                    display: 'flex', // Needed for children
                }} />

                {/* Content Card */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '60px',
                    position: 'relative', // To sit on top of gradient
                    zIndex: 10,
                }}>
                    {/* Store Badge */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '20px',
                    }}>
                        <div style={{
                            backgroundColor: '#FE7501',
                            height: '4px',
                            width: '40px',
                            borderRadius: '2px',
                        }} />
                        <div style={{
                            color: '#FE7501',
                            fontSize: 24,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                        }}>
                            {storeName}
                        </div>
                    </div>

                    {/* Product Title */}
                    <div style={{
                        color: 'white',
                        fontSize: 72,
                        fontWeight: 900,
                        lineHeight: 1.1,
                        marginBottom: '24px',
                        textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        maxWidth: '90%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        {product.name}
                    </div>

                    {/* Price Tag */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '24px' }}>
                        <div style={{
                            color: 'white',
                            fontSize: 56,
                            fontWeight: 800,
                        }}>
                            {price}
                        </div>
                        {hasPromo && (
                            <div style={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: 36,
                                textDecoration: 'line-through',
                                fontWeight: 500,
                            }}>
                                {comparePrice}
                            </div>
                        )}
                        {hasPromo && (
                            <div style={{
                                backgroundColor: '#EF4444',
                                color: 'white',
                                fontSize: 24,
                                fontWeight: 700,
                                padding: '4px 16px',
                                borderRadius: '100px',
                                marginLeft: '10px',
                            }}>
                                PROMO
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
