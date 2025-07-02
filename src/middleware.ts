import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


const protectedRoutes = ['/dashboard', '/dashboard/appointments', '/dashboard/services', '/dashboard/staff', '/dashboard/settings', '/dashboard/analytics'];
const superadminRoutes = ['/superadmin'];

export async function middleware(request: NextRequest) {
  const idToken = request.cookies.get('firebaseToken')?.value;

  // Check if it's a superadmin route
  const isSuperadminRoute = superadminRoutes.some(route =>
    request.nextUrl.pathname === route ||
    request.nextUrl.pathname.startsWith(`${route}/`)
  );

  // Check if it's a regular protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname === route ||
    request.nextUrl.pathname.startsWith(`${route}/`)
  );

  // Handle superadmin routes
  if (isSuperadminRoute) {
    // Allow access to superadmin login page
    if (request.nextUrl.pathname === '/superadmin/login') {
      return NextResponse.next();
    }

    // For /superadmin route (dashboard), redirect to login if not authenticated
    // We can't check localStorage in middleware, so we redirect and let client handle it
    if (request.nextUrl.pathname === '/superadmin') {
      // Check if there's a superadmin token in cookies (we'll set this on login)
      const superadminToken = request.cookies.get('superadmin_token')?.value;
      if (!superadminToken) {
        const loginUrl = new URL('/superadmin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    // For other superadmin routes, allow access (authentication handled client-side)
    return NextResponse.next();
  }

  // Handle regular protected routes
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!idToken) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/superadmin/:path*',
  ],
};
