import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'
import { API_URL } from '@/lib/api'

// Este middleware protegerá automáticamente las rutas que se especifiquen abajo
export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Si el usuario no está autenticado y está intentando acceder a rutas protegidas
    // será redirigido automáticamente a la página de inicio de sesión

    // Rutas protegidas por rol de administrador
    const isAdminRoute = pathname.startsWith('/admin')
    
    if (isAdminRoute) {
      const userEmail = token?.email || ''
      
      // Verificar si es empleado consultando la API
      try {
        const response = await fetch(`${API_URL}/api/auth/check-employee?email=${encodeURIComponent(userEmail)}`)
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.is_employee) {
            // Usuario es empleado, permitir acceso
            return NextResponse.next()
          }
        }
      } catch (error) {
        console.error('Error verificando empleado:', error)
      }
      
      // No es empleado o hubo error, redirigir
      const homeUrl = new URL('/', req.url)
      homeUrl.searchParams.set('error', 'access_denied')
      return NextResponse.redirect(homeUrl)
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
    '/admin/:path*',
    '/usuario/:path*'
  ]
}
