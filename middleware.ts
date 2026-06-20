// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================
// CONFIGURATION
// ============================================

const publicRoutes = ["/login", "/register"];

// ============================================
// MIDDLEWARE
// ============================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Get token from cookies
  const token = request.cookies.get("access_token")?.value;

  // Case 1: No token and trying to access protected route → redirect to login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Case 2: No token and trying to access root → redirect to login
  if (!token && pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Case 3: Has token and trying to access public route → redirect to dashboard
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Case 4: Has token and trying to access root → redirect to dashboard
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow all other requests
  return NextResponse.next();
}

// ============================================
// CONFIG - Which paths the middleware runs on
// ============================================

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};