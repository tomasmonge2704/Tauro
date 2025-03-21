import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Verificar si la ruta es una ruta de API de NextAuth
  if (req.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Intentar obtener el token de NextAuth
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // Rutas de autenticación (login)
  const isLoginRoute = req.nextUrl.pathname.startsWith('/login');
  
  // Si no es la ruta de login y el usuario no está autenticado, redirigir al login
  if (!isLoginRoute && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Si el usuario está autenticado y trata de acceder a la ruta de login, redirigir a la página principal
  if (isLoginRoute && token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

// Configurar las rutas en las que se ejecutará el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API routes of NextAuth.js)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}; 