import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// Route protette che richiedono autenticazione
const protectedRoutes = ['/dashboard', '/prodotti'];

// Route pubbliche (accessibili solo se NON autenticati)
const publicOnlyRoutes = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ottieni token dal cookie
  const token = request.cookies.get('session_token')?.value;
  
  // Verifica se l'utente è autenticato
  const payload = token ? await verifyToken(token) : null;
  const isAuthenticated = !!payload;

  // Controlla se la route è protetta
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Controlla se la route è solo per utenti non autenticati
  const isPublicOnlyRoute = publicOnlyRoutes.some(route => pathname.startsWith(route));

  // Se la route è protetta e l'utente non è autenticato, redirect a login
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Se la route è solo pubblica e l'utente è autenticato, redirect a dashboard
  if (isPublicOnlyRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};