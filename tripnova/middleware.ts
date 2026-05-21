import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, profile } = await updateSession(request);
  const nextUrl = request.nextUrl;
  const path = nextUrl.pathname;

  // Paths list
  const isAuthPage = path.startsWith('/login') || 
                     path.startsWith('/signup') || 
                     path.startsWith('/forgot-password') || 
                     path.startsWith('/reset-password');

  const isProtectedPage = path.startsWith('/dashboard') || 
                          path.startsWith('/vendor') || 
                          path.startsWith('/admin') || 
                          path.startsWith('/onboarding');

  // 1. If trying to access protected route but not logged in
  if (isProtectedPage && !user) {
    const loginUrl = new URL('/login', request.url);
    // Keep return url
    loginUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If logged in and accessing auth pages (login/signup etc.), redirect to appropriate dashboard
  if (user && isAuthPage) {
    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (profile?.role === 'vendor') {
      return NextResponse.redirect(new URL('/vendor', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 3. If logged in but onboarding is not completed, redirect to /onboarding
  // (unless they are already on /onboarding or are an admin/vendor who bypasses onboarding)
  if (user && profile && !profile.is_onboarding_completed && profile.role === 'user' && path !== '/onboarding') {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // 4. If logged in, onboarding is completed, and user tries to access /onboarding
  if (user && profile?.is_onboarding_completed && path === '/onboarding') {
    if (profile.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (profile.role === 'vendor') {
      return NextResponse.redirect(new URL('/vendor', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 5. Role restrictions
  if (user && profile) {
    // Admin route check
    if (path.startsWith('/admin') && profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Vendor route check
    if (path.startsWith('/vendor') && profile.role !== 'vendor') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - all SVG, PNG, JPG, JPEG, GIF, WEBP files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
