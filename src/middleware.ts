import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes
  const isCustomerRoute = pathname.startsWith('/customer');
  const isAdminRoute = pathname.startsWith('/admin');

  if (isCustomerRoute || isAdminRoute) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = await verifySessionToken(token);

    if (!payload) {
      // Invalid token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based access control
    if (isAdminRoute && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/customer/dashboard', request.url));
    }

    if (isCustomerRoute && payload.role !== 'CUSTOMER' && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Prevent authenticated users from visiting login/register pages
  const isAuthRoute = pathname === '/login' || pathname === '/register';
  if (isAuthRoute) {
    const token = request.cookies.get('auth_token')?.value;
    if (token) {
      const payload = await verifySessionToken(token);
      if (payload) {
        if (payload.role === 'ADMIN') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
        return NextResponse.redirect(new URL('/customer/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/customer/:path*', '/admin/:path*', '/login', '/register'],
};
