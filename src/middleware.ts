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

// R15 · F0 (sesión 53, 28-oct-2026; revisado en F0 v2, sesión 57, 29-oct), interruptor del sitio nuevo (R15-CONTRATO-V2 §7).
// Se lee en cada petición, como MW1. Sin la variable (producción) ninguna dirección se reescribe: todo se comporta como antes.
function sitioNuevoEncendido(): boolean {
  return process.env.ARCA_SITIO_NUEVO === '1'
}

// Con ARCA_SITIO_NUEVO=1, la dirección pública que está en RUTAS_SITIO_NUEVO se sirve con su página de src/app/nuevo/…
// (la barra de direcciones no cambia). null = sigue la página de hoy. Una ruta protegida que entre a la lista (Mi cuenta)
// pasa por aquí solo DESPUÉS de que withAuth la dejó pasar (ver `conSesion`).
// La URL de la reescritura sale de req.nextUrl: Next la trata como interna solo si su origen coincide con el del servidor. En
// Docker (HOSTNAME=0.0.0.0) coincide; con HOSTNAME=127.0.0.1 NextURL la cambia a «localhost» y Next la manda como proxy externo
// (medido, REVISION-CODIGO-F0.md H3): un arnés usa HOSTNAME=localhost.
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
// F0 v2 (29-oct, P2 aprobada por el líder 04:46 UTC): nombre neutro. Toda reescritura de Next deja la cabecera
// `x-middleware-rewrite: <destino>` en la respuesta (resolve-routes.js:434, no se puede quitar), así que el destino no dice
// «sitio-nuevo». No se usa notFound() en src/app/nuevo/layout.tsx: esa 404 sale del render dinámico y cambia otras cabeceras
// (sin x-nextjs-cache/x-nextjs-prerender) frente a la 404 de cualquier dirección inexistente, y obliga a marcar en una cabecera
// de la petición qué se reescribió (falsificable si el middleware no la limpia). Medido en REVISION-CODIGO-F0.md (H1).
const RUTA_SIN_PAGINA = '/_no-existe'

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

  // Lo demás que casa el matcher (solo las direcciones de RUTAS_SITIO_NUEVO y de PREFIJOS_SITIO_NUEVO): la página de hoy, salvo que el
  // interruptor esté encendido.
  return reescrituraSitioNuevo(req) ?? NextResponse.next()
}

// F0 v2 (29-oct, P1 aprobada por el líder 04:46 UTC): el middleware corre SOLO donde tiene algo que hacer. La F0 vieja traía un
// matcher general ('/((?!api/|_next/|.*\\..*).*)') que lo corría en toda página de producción con el interruptor apagado:
// +1.1 a +1.7 ms de mediana por página, medido (REVISION-CODIGO-F0.md, H4). Con esta lista, toda dirección que no esté aquí
// responde igual que antes de R15 (8235d9e^).
// Next exige literales estáticos (no se puede importar RUTAS_SITIO_NUEVO): **cada dirección que se agregue a RUTAS_SITIO_NUEVO
// se agrega también aquí.** Lo vigila comprobar-matcher-sitio-nuevo.mjs (qa) contra .next/server/middleware-manifest.json.
export const config = {
  matcher: [
    // Las protegidas de siempre (el mismo texto que antes de R15: casan también la ruta sin subruta, .json y .rsc)
    '/dashboard/:path*',
    '/ordenes/:path*',
    '/perfil/:path*',
    '/admin/:path*',
    '/usuario/:path*',
    // R15: /nuevo directo (también /nuevo.rsc y /nuevo.json) → 404
    '/nuevo/:path*',
    // R15: las direcciones públicas de RUTAS_SITIO_NUEVO (src/lib/sitio-nuevo.ts), una por una
    '/',
    // R15 v2 · F3 (D-F3-04, D-F3-22): la tienda, la ficha (UN segmento: no corre en /producto, /productos ni /producto/a/b), el carrito,
    // el checkout y su resultado (las 4 por separado: /checkout/<otra> sigue sin middleware y 404) y la confirmación de la suscripción.
    // D-F3-39: se decide con el camino CRUDO, y el único lugar donde Next lo tiene es aquí: corre los matchers sobre el camino tal como
    // llegó y sobre su versión decodificada (resolve-routes.js), pero al middleware le da req.url y nextUrl ya normalizados (sin el
    // sufijo .rsc y con %2E%2E resuelto: /producto/%2E%2E llega como /) y sin la cabecera RSC ni ?_rsc= (web/adapter.js). Por eso:
    // - cada dirección exacta es su texto con «(?![.])»: Next agrega a todo matcher (\.json|\.rsc|\.segments/…)?, y con «no sigue un
    //   punto» /tienda.rsc y /tienda.json no corren el middleware y responden como hoy;
    // - la ficha es UN segmento sin puntos ni barra invertida (\x5C) y sin . / \ codificados (%2E, %2F, %5C), tampoco al decodificarlo.
    // La navegación del cliente (cabecera RSC, ?_rsc=) pide el camino limpio y sí casa.
    '/:exacta(tienda(?![.]))',
    '/producto/:id((?![^/]*%(?:2[eEfF]|5[cC]))[^/.#?\\x5C]+(?![.]))',
    '/:exacta(carrito(?![.]))',
    '/:exacta(checkout(?![.]))',
    '/checkout/:exacta(success(?![.]))',
    '/checkout/:exacta(pending(?![.]))',
    '/checkout/:exacta(failure(?![.]))',
    '/suscripciones/:exacta(confirmacion(?![.]))',
    // R15 v2 · F4 (D-F4-03, D-F4-11 P-3), con la misma forma de D-F3-39/D-F3-40: la lista de experiencias, eventos privados y catering
    // (exactas: /catering/contacto sigue sin middleware) y la ficha de una experiencia como UN segmento, sin faq ni testimonios (páginas de
    // hoy que se quedan; también van en EXCLUIDOS_SITIO_NUEVO, comparados ya decodificados).
    '/:exacta(experiencias(?![.]))',
    '/experiencias/:slug((?!(?:faq|testimonios)(?:[/.#?]|$))(?![^/]*%(?:2[eEfF]|5[cC]))[^/.#?\\x5C]+(?![.]))',
    '/:exacta(eventos(?![.]))',
    '/:exacta(catering(?![.]))',
    // R15 v2 · F5 (D-F5-03), con la misma forma de D-F3-39/D-F3-40: siete exactas (chinampas y FAQ hoy no existen). Siguen sin middleware
    // /xochimilco (DR-7, hasta F7), /receta/<id> (C44) y, desde F4, /experiencias/faq y /catering/contacto.
    '/:exacta(chinampas(?![.]))',
    '/:exacta(nosotros(?![.]))',
    '/:exacta(recetas(?![.]))',
    '/:exacta(faq(?![.]))',
    '/:exacta(contacto(?![.]))',
    '/:exacta(privacidad(?![.]))',
    '/:exacta(terminos(?![.]))',
    // R15 v2 · F6 (D-F6-03), con la misma forma de D-F3-39/D-F3-40: las tres de entrar sin sesión. Las de Mi cuenta con sesión (`/usuario/…`) no
    // necesitan matcher nuevo: ya las casa '/usuario/:path*' de arriba (las protegidas no cambian) y se reescriben solo después de withAuth.
    '/auth/:exacta(signin(?![.]))',
    '/auth/:exacta(recuperar(?![.]))',
    '/auth/:exacta(restablecer(?![.]))',
  ],
}
