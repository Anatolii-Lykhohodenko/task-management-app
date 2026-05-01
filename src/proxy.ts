import { authConfig } from '@/auth.config';
import { rootRoute } from '@/lib/routes';
import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
const { auth } = NextAuth(authConfig);

const authRoutes = ['/auth/login', '/auth/register'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthRoute = authRoutes.includes(pathname);
  const isLoggedIn = !!req.auth;

  if (!isAuthRoute && !isLoggedIn) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set(
      'callbackUrl',
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(rootRoute, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
