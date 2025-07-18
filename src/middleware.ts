import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

// Este middleware protegerá automáticamente las rutas que se especifiquen abajo
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Si el usuario no está autenticado y está intentando acceder a rutas protegidas
    // será redirigido automáticamente a la página de inicio de sesión

    // Rutas protegidas por rol de administrador
    const isAdminRoute = pathname.startsWith('/admin')
    if (isAdminRoute && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Podemos añadir más lógica específica según necesidades
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

// Proteger solo estas rutas
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/ordenes/:path*',
    '/perfil/:path*',
    '/admin/:path*'
    // '/suscripciones/:path*' // Temporalmente desactivado mientras auth está deshabilitado
  ]
}
