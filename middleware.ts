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

    if (subdomain) {
        // Rewrite to storefront route with store slug
        const url = request.nextUrl.clone();
        url.pathname = `/store/${subdomain}${pathname}`;

        // Add store slug as header for server components
        const response = NextResponse.rewrite(url);
        response.headers.set("x-store-slug", subdomain);
        return response;
    }

    // Protected routes check
    const protectedPaths = ["/dashboard", "/admin"];
    const isProtectedPath = protectedPaths.some((path) =>
        pathname.startsWith(path)
    );

    if (isProtectedPath) {
        // Update session and check auth
        const response = await updateSession(request);

        // The session update handles auth refresh
        // Additional auth checks can be added here if needed
        return response;
    }

    // Auth callback route
    if (pathname.startsWith("/auth/callback")) {
        return await updateSession(request);
    }

    return NextResponse.next();
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
