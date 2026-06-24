import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    );
    const exp = payload.exp || 0;
    return Date.now() >= (exp * 1000) - 30000;
  } catch {
    return true;
  }
}

function getTokenFromCookie(request: NextRequest): string | null {
  return request.cookies.get('access_token')?.value || null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = getTokenFromCookie(request);
  const isValidToken = token && !isTokenExpired(token);

  const isPublicRoute =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname.startsWith('/api/auth');

  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  const isStaticAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname === '/favicon.ico';

  if (isStaticAsset) {
    return NextResponse.next();
  }

  console.log(`[Middleware] Path: ${pathname}, HasToken: ${!!token}, IsValid: ${isValidToken}, IsPublic: ${isPublicRoute}, IsAuthRoute: ${isAuthRoute}`);

  if (token && !isValidToken) {
    const response = NextResponse.next();
    response.cookies.delete('access_token');
    console.log('[Middleware] Expired token cleared');
    return response;
  }

  if (isValidToken && isAuthRoute) {
    console.log('[Middleware] Valid token on auth route, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isValidToken && pathname === '/') {
    console.log('[Middleware] Valid token on root, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!isValidToken && !isPublicRoute) {
    console.log('[Middleware] No valid token on protected route, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
};