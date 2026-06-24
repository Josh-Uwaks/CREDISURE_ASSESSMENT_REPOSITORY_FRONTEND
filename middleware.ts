// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ✅ Helper to check if token is expired
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    );
    const exp = payload.exp || 0;
    // Add 30-second buffer
    return Date.now() >= (exp * 1000) - 30000;
  } catch {
    return true;
  }
}

// ✅ Helper to get token from cookie
function getTokenFromCookie(request: NextRequest): string | null {
  return request.cookies.get('access_token')?.value || null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = getTokenFromCookie(request);
  
  // ✅ Check if token exists AND is valid (not expired)
  const isValidToken = token && !isTokenExpired(token);
  
  // ✅ Define public routes
  const isPublicRoute = 
    pathname === '/login' || 
    pathname === '/register' || 
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname.startsWith('/api/auth');
  
  // ✅ Define static/public assets
  const isStaticAsset = 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/images') || 
    pathname.startsWith('/fonts') ||
    pathname === '/favicon.ico';
  
  // ✅ Always allow static assets
  if (isStaticAsset) {
    return NextResponse.next();
  }
  
  // ✅ Debug logging
  console.log(`[Middleware] Path: ${pathname}, HasToken: ${!!token}, IsValid: ${isValidToken}, IsPublic: ${isPublicRoute}`);
  
  // ✅ If token is expired, clear it
  if (token && !isValidToken) {
    const response = NextResponse.next();
    response.cookies.delete('access_token');
    console.log('[Middleware] Expired token cleared');
    return response;
  }
  
  // ✅ If user has valid token and tries to access public route -> redirect to dashboard
  if (isValidToken && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // ✅ If user has NO valid token and tries to access protected route -> redirect to login
  if (!isValidToken && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // ✅ Allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
};