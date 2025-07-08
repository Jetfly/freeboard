import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Forcer une vérification de session fraîche
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // Vérifier si l'utilisateur vient de se déconnecter (pas de token mais encore des cookies)
  const authToken = req.cookies.get('sb-irgykbpyraczsyehrpbw-auth-token');
  const hasAuthCookie = !!authToken;
  
  // Si pas de session mais qu'il y a encore un cookie, forcer la suppression
  if (!session && hasAuthCookie) {
    console.log('🧹 Middleware - Nettoyage cookie de session orphelin');
    res.cookies.delete('sb-irgykbpyraczsyehrpbw-auth-token');
  }

  // Debug logs
  console.log(`🔍 Middleware - Path: ${req.nextUrl.pathname}`);
  console.log(`🔍 Middleware - Session: ${session ? `✅ User: ${session.user?.email}` : '❌ No session'}`);
  console.log(`🔍 Middleware - Cookies:`, req.cookies.getAll().map(c => c.name));

  // Routes protégées qui nécessitent une authentification
  const protectedRoutes = ['/dashboard', '/transactions', '/reports', '/parametres'];
  
  // Routes publiques (pas besoin d'authentification)
  const publicRoutes = ['/login', '/signup', '/'];

  const { pathname } = req.nextUrl;

  // Si l'utilisateur est connecté et essaie d'accéder aux pages de connexion/inscription
  if (session && (pathname === '/login' || pathname === '/signup')) {
    console.log('🔄 Middleware - Redirection: Utilisateur connecté vers dashboard');
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
    console.log('🔄 Middleware - Redirection: Route protégée vers login');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Rediriger la page d'accueil vers le dashboard si connecté, sinon vers login
  if (pathname === '/') {
    if (session) {
      console.log('🔄 Middleware - Redirection: Accueil vers dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } else {
      console.log('🔄 Middleware - Redirection: Accueil vers login');
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  console.log('✅ Middleware - Pas de redirection, accès autorisé');

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};