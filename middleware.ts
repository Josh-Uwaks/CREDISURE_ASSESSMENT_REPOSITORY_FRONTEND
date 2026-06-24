// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
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
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname.startsWith('/api/auth');

  const isStaticAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname === '/favicon.ico';

  if (isStaticAsset) {
    return NextResponse.next();
  }

  if (token && !isValidToken) {
    const response = NextResponse.next();
    response.cookies.delete('access_token');
    return response;
  }

  if (isValidToken && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (!isValidToken && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
};