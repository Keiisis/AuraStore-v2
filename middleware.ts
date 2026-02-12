import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Multi-tenancy: Extract subdomain and route to storefront
function getSubdomain(request: NextRequest): string | null {
    const hostname = request.headers.get("host") || "";
    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "aurastore.com";

    // Local development: check for subdomain.localhost:3000
    if (hostname.includes("localhost")) {
        const parts = hostname.split(".");
        if (parts.length > 1 && parts[0] !== "www") {
            return parts[0];
        }
        return null;
    }

    // Production: check for subdomain.aurastore.com
    if (hostname.endsWith(`.${appDomain}`)) {
        const subdomain = hostname.replace(`.${appDomain}`, "");
        if (subdomain && subdomain !== "www") {
            return subdomain;
        }
    }

    return null;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isProtectedPath = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

    // Skip middleware for static files and API routes
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.includes(".") // Static files
    ) {
        return NextResponse.next();
    }

    // Check for subdomain (multi-tenancy)
    const subdomain = getSubdomain(request);

    // Base response (either next() or rewrite())
    let response: NextResponse;

    if (subdomain) {
        // Rewrite to storefront route with store slug
        const url = request.nextUrl.clone();
        url.pathname = `/store/${subdomain}${pathname}`;
        response = NextResponse.rewrite(url);
        response.headers.set("x-store-slug", subdomain);
    } else if (isProtectedPath) {
        response = await updateSession(request);
    } else if (pathname.startsWith("/auth/callback")) {
        response = await updateSession(request);
    } else {
        response = NextResponse.next();
    }

    // ============================================================
    // SECURITY HEADERS INJECTION (Kage Level Protection)
    // ============================================================
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://cdn.cinetpay.com;
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https://* border-radius.com;
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        block-all-mixed-content;
        upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set("Content-Security-Policy", cspHeader);
    response.headers.set("X-Frame-Options", "DENY"); // Prevent Clickjacking
    response.headers.set("X-Content-Type-Options", "nosniff"); // Prevent MIME Sniffing
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(self), microphone=(), geolocation=()"); // Limit capabilities

    // Strict Transport Security (HSTS) - Force HTTPS
    if (process.env.NODE_ENV === "production") {
        response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
