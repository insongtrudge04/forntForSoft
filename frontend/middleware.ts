import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isArtistRoute = createRouteMatcher(['/dashboard(.*)']);
const isBuyerRoute = createRouteMatcher(['/account(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/account(.*)', '/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as Record<string, string>)?.role;

  // Role-based access control
  if (userId) {
    if (isArtistRoute(req) && role !== 'artist' && role !== 'admin') {
      return NextResponse.redirect(new URL('/account', req.url));
    }
    if (isBuyerRoute(req) && role !== 'buyer' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    if (isAdminRoute(req) && role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
