import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server'
import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware'
import { API_URL } from '@/lib/api'
import { cabecerasDelCliente } from '@/lib/ip-cliente'
import { esRutaInternaSitioNuevo, rutaInternaSitioNuevo } from '@/lib/sitio-nuevo'

// MW1 (R3, 1-oct-2026): check-employee sale por la red interna (http://arca-api:8000), no por la URL
// pública que cruza Cloudflare. Se lee en cada petición: el middleware corre en el sandbox Edge de
// `next start`, que copia el process.env del servidor (no se inlinea al compilar). Sin la variable,
// la URL pública como antes.
function urlDeLaApi(): string {
  return process.env.INTERNAL_API_URL || API_URL
}

// R15 · F0 (sesión 53, 28-oct-2026), interruptor del sitio nuevo (R15-CONTRATO §3.2). Se lee en cada petición, como MW1.
// Sin la variable (producción) ninguna dirección se reescribe: todo se comporta como antes.
function sitioNuevoEncendido(): boolean {
  return process.env.ARCA_SITIO_NUEVO === '1'
}

// Con ARCA_SITIO_NUEVO=1, la dirección pública que está en RUTAS_SITIO_NUEVO se sirve con su página de src/app/nuevo/…
// (la barra de direcciones no cambia). null = sigue la página de hoy. Una ruta protegida que entre a la lista (Mi cuenta, F3)
// pasa por aquí solo DESPUÉS de que withAuth la dejó pasar (ver `conSesion`).
function reescrituraSitioNuevo(req: NextRequest): NextResponse | null {
  if (!sitioNuevoEncendido()) return null
  const destino = rutaInternaSitioNuevo(req.nextUrl.pathname)
  if (!destino) return null
  const url = req.nextUrl.clone()
  url.pathname = destino
  return NextResponse.rewrite(url)
}

// `/nuevo` y `/nuevo/*` pedidos directo: 404 en los dos contenedores. Se reescribe a una ruta que no puede existir (en el App
// Router una carpeta con «_» es privada y nunca es ruta), así sale la misma página 404 de cualquier dirección inexistente.
const RUTA_SIN_PAGINA = '/_sitio-nuevo-sin-ruta'

function decodificada(pathname: string): string {
  try {
    return decodeURIComponent(pathname)
  } catch {
    return pathname
  }
}

function noExiste(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone()
  url.pathname = RUTA_SIN_PAGINA
  url.search = ''
  return NextResponse.rewrite(url)
}

// Las rutas protegidas de siempre, con la MISMA expresión que Next compilaba del matcher de antes ('/dashboard/:path*',
// '/ordenes/:path*', '/perfil/:path*', '/admin/:path*', '/usuario/:path*'; copiada de .next/server/middleware-manifest.json de la
// imagen de producción del 28-oct): con y sin subruta, con .json/.rsc y el prefijo de /_next/data. Next prueba el matcher con la
// dirección decodificada (medido: /admin%2Fx también mandaba al login), por eso se prueba la cruda y la decodificada.
const PROTEGIDAS = ['dashboard', 'ordenes', 'perfil', 'admin', 'usuario'].map(
  (raiz) =>
    new RegExp(
      `^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/${raiz}(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\.json|\\.rsc|\\.segments\\/.+\\.segment\\.rsc)?[\\/#\\?]?$`
    )
)

function esRutaProtegida(pathname: string): boolean {
  const candidatas = [pathname, decodificada(pathname)]
  return candidatas.some((p) => PROTEGIDAS.some((re) => re.test(p)))
}

// Este middleware protegerá automáticamente las rutas que se especifiquen abajo
// (R15: es el mismo de antes, sin cambios de lógica; solo sus «dejar pasar» pasan por reescrituraSitioNuevo, que en F0 regresa
// null para toda ruta protegida porque ninguna está en RUTAS_SITIO_NUEVO.)
const conSesion = withAuth(
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
        // MW1: el endpoint tiene límite por IP (30/min). Lo pide el SERVIDOR de Next, así que sin
        // estas cabeceras todos los empleados contaban como una sola IP. `req.headers` es un
        // `Headers` (NextRequest extiende Request): cabecerasDelCliente lee cf-connecting-ip y,
        // con INTERNAL_API_SECRET, manda X-Cliente-IP firmada; si falta algo regresa {}.
        const response = await fetch(`${urlDeLaApi()}/api/auth/check-employee`, {
          headers: {
            ...cabecerasDelCliente(req.headers),
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        })

        if (response.ok) {
          const data = await response.json()

          if (data.is_employee) {
            // Usuario es empleado, permitir acceso
            return reescrituraSitioNuevo(req) ?? NextResponse.next()
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
          return reescrituraSitioNuevo(req) ?? NextResponse.next()
        }
      } catch (error) {
        // Ni siquiera hubo respuesta HTTP (red, DNS, la API caida). Mismo
        // criterio que arriba: no sabemos, asi que no afirmamos.
        console.error('[middleware] no se pudo verificar el acceso:', error)
        return reescrituraSitioNuevo(req) ?? NextResponse.next()
      }

      // Llegar aqui significa que el backend dijo explicitamente que NO:
      // o `is_employee: false`, o 401/403 sobre la identidad de quien llama.
      const homeUrl = new URL('/', req.url)
      homeUrl.searchParams.set('error', 'access_denied')
      return NextResponse.redirect(homeUrl)
    }

    // Podemos añadir más lógica específica según necesidades
    return reescrituraSitioNuevo(req) ?? NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl

  // R15: la ruta interna del sitio nuevo nunca se sirve en su propia dirección (en ninguno de los dos contenedores).
  if (esRutaInternaSitioNuevo(pathname) || esRutaInternaSitioNuevo(decodificada(pathname))) {
    return noExiste(req)
  }

  // Las rutas protegidas de siempre: el mismo withAuth, con la misma lógica.
  if (esRutaProtegida(pathname)) {
    return conSesion(req as NextRequestWithAuth, event)
  }

  // Todo lo demás: la página de hoy, salvo que el interruptor esté encendido y la dirección esté en la lista.
  return reescrituraSitioNuevo(req) ?? NextResponse.next()
}

export const config = {
  matcher: [
    // Las protegidas de siempre (mismo texto que antes del 28-oct: casan también la ruta sin subruta, .json y .rsc)
    '/dashboard/:path*',
    '/ordenes/:path*',
    '/perfil/:path*',
    '/admin/:path*',
    '/usuario/:path*',
    // R15: /nuevo directo (también /nuevo.rsc y /nuevo.json) → 404
    '/nuevo/:path*',
    // R15: el resto de las páginas, para la reescritura del link de revisión. Fuera /_next/, /api/ y todo archivo con
    // extensión (imágenes, manifest.json, sw.js, robots.txt, sitemap.xml).
    '/((?!api/|_next/|.*\\..*).*)',
  ],
}
