import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserData } from "@/app/utils/getUserData";
import { allowedRoutes } from "@/constants/routes";

export async function middleware(req: NextRequest) {
  // Intentar obtener el token de NextAuth
  const user = await getUserData(req);
  
  // Rutas de autenticación (login)
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');
  const isAuthApiRoute = req.nextUrl.pathname.startsWith('/api/auth');
  const isSecureRoute = allowedRoutes.includes(req.nextUrl.pathname);
  // Verificar acceso a rutas de API para administradores
  if (isApiRoute && !isAuthApiRoute && user && !isSecureRoute) {
    const isAdmin = user.isAdmin;
    if (!isAdmin) {
      // Si no es administrador, devolver respuesta 403 Forbidden
      return new NextResponse(
        JSON.stringify({ error: 'Acceso denegado. Solo administradores pueden acceder a esta API' }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  return NextResponse.next();
}

// Configurar las rutas en las que se ejecutará el middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/api/:path*'
  ],
}; 