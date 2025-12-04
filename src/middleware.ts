import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


let protectedRoutes = ['/dashboard', '/dashboard/appointments', '/dashboard/services', '/dashboard/staff', '/dashboard/settings', '/dashboard/analytics'];
let superadminRoutes = ['/superadmin'];

export async function middleware(request: NextRequest) {
  let idToken = request.cookies.get('firebaseToken')?.value;

  let isSuperadminRoute = superadminRoutes.some(route =>
    request.nextUrl.pathname === route ||
    request.nextUrl.pathname.startsWith(`${route}/`)
  );

  let isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname === route ||
    request.nextUrl.pathname.startsWith(`${route}/`)
  );

  if (isSuperadminRoute) {
    if (request.nextUrl.pathname === '/superadmin/login') {
      return NextResponse.next();
    }
    if (request.nextUrl.pathname === '/superadmin') {
      let superadminToken = request.cookies.get('superadmin_token')?.value;
      if (!superadminToken) {
        let loginUrl = new URL('/superadmin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
    return NextResponse.next();
  }
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!idToken) {
    let loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export let config = {
  matcher: [
    '/dashboard/:path*',
    '/superadmin/:path*',
  ],
};
