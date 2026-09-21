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
      // Verificar si es empleado consultando la API.
      //
      // Se manda el token del backend, NO el correo. Antes se pasaba el correo
      // como parametro y el endpoint contestaba sin pedir credencial: cualquiera
      // desde internet podia enumerar la plantilla. Ahora el endpoint responde
      // solo sobre quien llama, asi que la identidad va en el Authorization.
      const accessToken = (token as { accessToken?: string } | null)?.accessToken

      try {
        const response = await fetch(`${API_URL}/api/auth/check-employee`, {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        })

        if (response.ok) {
          const data = await response.json()

          if (data.is_employee) {
            // Usuario es empleado, permitir acceso
            return NextResponse.next()
          }
          // Respuesta clara y negativa: no es empleado. Cae al redirect.
        } else if (response.status !== 401 && response.status !== 403) {
          // La respuesta NO dice nada sobre quien llama: 429 porque se agoto la
          // cuota, 5xx, la API reiniciandose. Antes esto se trataba igual que un
          // "no eres empleado" y se expulsaba al panel con ?error=access_denied
          // — con la sesion viva y con token. El mensaje mentia: no era falta de
          // permiso, era falta de cuota.
          //
          // Se deja pasar a proposito. El candado de verdad esta en el backend:
          // `requiere_permiso()` cuelga de 17 routers (114 endpoints) y sin rol
          // asignado deniega, asi que lo peor que puede ver alguien sin permiso
          // es un panel vacio — mientras que expulsar a quien SI tiene permiso
          // le rompe el trabajo y ademas le miente.
          console.warn(
            `[middleware] check-employee no fue concluyente (HTTP ${response.status}); ` +
              'se permite el paso y el backend decide por endpoint'
          )
          return NextResponse.next()
        }
      } catch (error) {
        // Ni siquiera hubo respuesta HTTP (red, DNS, la API caida). Mismo
        // criterio que arriba: no sabemos, asi que no afirmamos.
        console.error('[middleware] no se pudo verificar el acceso:', error)
        return NextResponse.next()
      }

      // Llegar aqui significa que el backend dijo explicitamente que NO:
      // o `is_employee: false`, o 401/403 sobre la identidad de quien llama.
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
