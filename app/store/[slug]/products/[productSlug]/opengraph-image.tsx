import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/actions/product";
import { getStoreBySlug } from "@/lib/actions/store";

export const runtime = "edge";

export const alt = "Aura Store Product Preview";
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string; productSlug: string } }) {
    const product = await getProductBySlug(params.slug, params.productSlug);
    const store = await getStoreBySlug(params.slug);

    if (!product) {
        return new ImageResponse(
            (
                <div
                    style={{
                        background: "black",
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 64,
                        fontWeight: 900,
                    }}
                >
                    Aura Store
                </div>
            )
        );
    }

    const price = `${product.price.toLocaleString("fr-FR")} FCFA`;
    const storeName = store?.name || "Aura Store";
    const image = product.images?.[0];

    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "row", // Split layout
                    backgroundColor: "#050505",
                    position: "relative",
                }}
            >
                {/* Background Texture/Gradient */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "radial-gradient(circle at 30% 50%, #1a1a1a 0%, #000000 100%)",
                    }}
                />

                {/* Orange Glow Effect */}
                <div
                    style={{
                        position: "absolute",
                        width: "600px",
                        height: "600px",
                        left: "-100px",
                        top: "-100px",
                        background: "#FE7501",
                        opacity: 0.15,
                        filter: "blur(150px)",
                        borderRadius: "100%",
                    }}
                />

                {/* Left Side: Product Image */}
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "60px",
                        zIndex: 10,
                    }}
                >
                    {image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={image}
                            alt={product.name}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                borderRadius: "20px",
                                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: "300px",
                                height: "300px",
                                background: "#111",
                                borderRadius: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#333",
                                fontSize: 40,
                            }}
                        >
                            No Image
                        </div>
                    )}
                </div>

                {/* Right Side: Info */}
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        padding: "60px",
                        zIndex: 20,
                    }}
                >
                    {/* Brand Tag */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "20px",
                        }}
                    >
                        <div
                            style={{
                                padding: "8px 16px",
                                background: "rgba(255,255,255,0.1)",
                                borderRadius: "100px",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "#FE7501",
                                fontSize: 20,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "2px",
                            }}
                        >
                            {storeName}
                        </div>
                    </div>

                    {/* Title */}
                    <h1
                        style={{
                            fontSize: 70,
                            fontWeight: 900,
                            color: "white",
                            margin: "0 0 20px 0",
                            lineHeight: 1.1,
                            textShadow: "0 4px 10px rgba(0,0,0,0.5)",
                        }}
                    >
                        {product.name}
                    </h1>

                    {/* Price */}
                    <div
                        style={{
                            fontSize: 50,
                            fontWeight: 700,
                            color: "#FE7501",
                            marginTop: "auto",
                            display: "flex",
                            alignItems: "baseline",
                        }}
                    >
                        {price}
                    </div>
                    <div style={{ color: "#666", fontSize: 24, marginTop: 10 }}>Disponible Immédiatement</div>
                </div>

                {/* Decorative Elements */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 40,
                        right: 40,
                        width: 20,
                        height: 20,
                        background: "#FE7501",
                        borderRadius: "50%",
                        boxShadow: "0 0 20px #FE7501",
                    }}
                />
            </div>
        ),
        {
            ...size,
        }
    );
}
