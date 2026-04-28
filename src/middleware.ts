/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/auth';
import { rootRoute } from '@/lib/utils';
import { NextResponse } from 'next/server';

const authRoutes = ['/auth/login', '/auth/register'];

export default auth((req : any) => {
  const { pathname } = req.nextUrl;
  const isAuthRoute = authRoutes.includes(pathname);
  const isLoggedIn = !!req.auth;

  if (!isAuthRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(rootRoute, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
