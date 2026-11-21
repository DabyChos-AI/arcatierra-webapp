/**
 * NextAuth Configuration
 * Configuración de autenticación para Arca Tierra
 */

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { API_URL } from '@/lib/api'
import { cabecerasDelCliente, cabecerasDelClienteActual } from '@/lib/ip-cliente'

/**
 * INT1 (R7): este archivo solo corre en el servidor de Next (lo importan route handlers). Refresh, login,
 * check-email, register y oauth-token van por la red interna (`INTERNAL_API_URL`, `http://arca-api:8000`)
 * como el middleware: el secreto interno y las cabeceras firmadas ya no cruzan Cloudflare. Sin la variable
 * (desarrollo local), la URL pública de siempre.
 */
function urlBackend(): string {
  return process.env.INTERNAL_API_URL || API_URL
}

/** CHKE1/OAU2 (S68): el secreto interno va SOLO en esta cabecera (nunca en la URL), a check-email y a oauth-token. */
function cabeceraInterna(): Record<string, string> {
  return { 'X-Internal-Api-Secret': process.env.INTERNAL_API_SECRET || '' }
}

/**
 * OAU2 (S68): el JWT de un usuario de Google que ya existe. El correo va en el CUERPO (`{"email"}`), no en la URL, que el access
 * log escribe en claro. La API de antes de S68 solo leía `?email=` y responde 422 a una petición sin él; la nueva no da 422 con el
 * cuerpo bien puesto (api, S68). Por eso, ante un 422, UN reintento con el correo también en la URL: el login con Google no se rompe
 * entre el despliegue de la webapp y el de la API, y con la API nueva el correo ya no toca la URL. Cuando las dos estén desplegadas,
 * el reintento se puede quitar.
 */
async function pedirTokenOAuth(backendUrl: string, email: string): Promise<Response> {
  const pedir = (url: string) =>
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...cabeceraInterna() },
      body: JSON.stringify({ email }),
    })
  const res = await pedir(`${backendUrl}/api/auth/oauth-token`)
  if (res.status !== 422) return res
  return pedir(`${backendUrl}/api/auth/oauth-token?email=${encodeURIComponent(email)}`)
}

// Función para renovar tokens usando el refresh_token
async function refreshAccessToken(token: any) {
  try {
    const backendUrl = urlBackend()
    
    // El token va en el cuerpo, nunca en la URL: el access log del backend la
    // escribe en claro y el refresh vale 7 dias (R1, 2026-09-29).
    const response = await fetch(`${backendUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: token.refreshToken }),
    })

    if (!response.ok) {
      console.error('❌ Error renovando token:', response.status)
      throw new Error('RefreshTokenError')
    }

    const refreshedTokens = await response.json()
    console.log('✅ Token renovado exitosamente')

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      accessTokenExpires: Date.now() + 23 * 60 * 60 * 1000, // 23 horas
    }
  } catch (error) {
    console.error('❌ Error en refreshAccessToken:', error)
    // Un token muerto NO debe sobrevivir a su renovacion fallida.
    // Antes se devolvia `{...token, error}` y el accessToken vencido seguia
    // ahi: la sesion se veia viva, el proxy lo mandaba al backend y este
    // respondia 401 "No se pudieron validar las credenciales" — en el ultimo
    // clic de la compra. El `error` se conserva solo para trazabilidad en los
    // logs; quien resuelve el caso es la AUSENCIA del token.
    return {
      ...token,
      accessToken: undefined,
      refreshToken: undefined,
      accessTokenExpires: 0,
      error: 'RefreshTokenError',
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const backendUrl = urlBackend()
          
          // Llamar al backend /api/auth/login
          const formData = new URLSearchParams()
          formData.append('username', credentials.email)
          formData.append('password', credentials.password)
          
          const response = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              // El límite de intentos del backend cuenta por la IP del cliente (A13)
              ...cabecerasDelCliente(req?.headers),
            },
            body: formData
          })

          if (!response.ok) {
            // CONS1 (R11): solo el status; un 422 del login trae el `input` (correo y contraseña)
            console.error('Login failed:', response.status)
            return null
          }

          const data = await response.json()
          
          // data tiene: { access_token, refresh_token, user: {...} }
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.nombre_completo || data.user.nombre,
            accessToken: data.access_token,
            refreshToken: data.refresh_token
          }
        } catch (error) {
          console.error('Error en authorize:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    // La cookie no puede vivir mas que el refresh token del backend
    // (REFRESH_TOKEN_EXPIRE_DAYS=7). Antes duraba 30 dias por el default de
    // NextAuth: entre el dia 7 y el 30 la sesion se veia viva con un token que
    // ya no se podia renovar. Como el refresh ROTA en cada renovacion exitosa,
    // esto son 7 dias de INACTIVIDAD, no de sesion.
    maxAge: 7 * 24 * 60 * 60,
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // AUTH2 (S67): antes TODO lo que no fuera /usuario/dashboard iba al dashboard, así que entrar con Google perdía el
      // callbackUrl (el login con correo no pasa por aquí: usa `redirect: false` y `destinoTrasLogin()`). Ahora se respeta
      // cualquier destino del MISMO origen (relativo o absoluto); uno de otro origen (`https://otro…`, `//otro…`, `/\otro…`) sigue
      // yendo al dashboard: sin redirección abierta. La raíz sigue mandando a la cuenta, como hoy (también el `signOut({ callbackUrl: '/' })`).
      const DESTINO_POR_OMISION = `${baseUrl}/usuario/dashboard`
      let destino: URL
      try {
        destino = new URL(url, baseUrl)
      } catch {
        return DESTINO_POR_OMISION
      }
      if (destino.origin !== new URL(baseUrl).origin) return DESTINO_POR_OMISION
      if (destino.pathname === '/') return DESTINO_POR_OMISION
      return destino.href
    },
    async signIn({ user, account, profile }) {
      // Cuando un usuario se registra con Google, guardarlo en BD
      if (account?.provider === 'google' && user.email) {
        try {
          const backendUrl = urlBackend()
          const delCliente = await cabecerasDelClienteActual()
          
          // Verificar si el usuario ya existe. CHKE1 (S68): con el secreto interno en la cabecera; sin él la API nueva responde 401
          // (nunca 404), que abajo NO se trata como «no existe». La API vieja ignora la cabecera.
          const checkResponse = await fetch(`${backendUrl}/api/auth/check-email?email=${encodeURIComponent(user.email)}`, {
            headers: cabeceraInterna(),
          })

          if (checkResponse.status === 404) {
            // Usuario no existe, crearlo
            const registerResponse = await fetch(`${backendUrl}/api/auth/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...delCliente },
              body: JSON.stringify({
                email: user.email,
                nombre: user.name?.split(' ')[0] || user.email.split('@')[0],
                apellidos: user.name?.split(' ').slice(1).join(' ') || '',
                nombre_completo: user.name || user.email,
                password: '', // OAuth no necesita password
                telefono: '',
                origen_registro: 'google_oauth'
              })
            })
            
            if (registerResponse.ok) {
              const result = await registerResponse.json()
              user.id = result.user?.id || result.user_id
              // ✅ NUEVO: Guardar JWT del backend para OAuth
              if (result.access_token) {
                Object.assign(user, {
                  accessToken: result.access_token,
                  refreshToken: result.refresh_token
                })
              }
              // CONS1 (R11): sin el correo ni el cuerpo del error en el log
              console.log('✅ Usuario Google guardado en BD')
            } else {
              // Cuando el registro falla: solo el status (el cuerpo puede traer lo capturado)
              console.error('❌ Error registrando usuario Google:', registerResponse.status, registerResponse.statusText)
            }
          } else if (checkResponse.ok) {
            // Usuario existe, obtener su ID
            const userData = await checkResponse.json()
            user.id = userData.id
            
            // ✅ NUEVO: Obtener JWT para usuario OAuth existente
            try {
              // El secreto va en cabecera (A13, 2026-09-27) y el correo en el cuerpo (OAU2, S68): en la URL el access log
              // del backend los escribía en claro en cada login con Google.
              const tokenResponse = await pedirTokenOAuth(backendUrl, user.email)

              if (tokenResponse.ok) {
                const tokenData = await tokenResponse.json()
                Object.assign(user, {
                  accessToken: tokenData.access_token,
                  refreshToken: tokenData.refresh_token
                })
                console.log('✅ JWT obtenido para usuario OAuth')
              } else {
                console.error('⚠️ No se pudo obtener JWT para el usuario OAuth:', tokenResponse.status)
              }
            } catch (error) {
              console.error('Error obteniendo JWT para OAuth:', error)
            }
          } else {
            // CHKE1 (S68): 401 (secreto que falta o no coincide), 429, 5xx… No es «no existe»: no se registra a nadie.
            // Solo el status, sin el correo (CONS1).
            console.error('⚠️ check-email no respondió bien:', checkResponse.status)
          }
        } catch (error) {
          console.error('Error guardando usuario de Google:', error)
          // Permitir login aunque falle el guardado
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      // Initial sign in - guardar tokens y tiempo de expiración
      if (user) {
        token.id = user.id
        if ((user as any).accessToken) {
          token.accessToken = (user as any).accessToken
          token.refreshToken = (user as any).refreshToken
          // Token expira en 23 horas (backend es 24h, renovamos 1h antes)
          token.accessTokenExpires = Date.now() + 23 * 60 * 60 * 1000
        }
        return token
      }

      // Si el token no ha expirado, devolverlo tal cual
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      // Token expirado - intentar renovar
      console.log('🔄 Token expirado, intentando renovar...')
      if (token.refreshToken) {
        return refreshAccessToken(token)
      }

      // No hay refresh token, no podemos renovar.
      // Si el access token ya vencio, se va con la misma regla de arriba: sin
      // forma de renovarlo, conservarlo solo sirve para que el backend lo
      // rechace mas tarde y en peor momento. (Es el caso de Google OAuth
      // cuando /api/auth/oauth-token falla en el callback de signIn.)
      console.error('⚠️ No hay refresh token disponible')
      if (token.accessTokenExpires && Date.now() >= (token.accessTokenExpires as number)) {
        return { ...token, accessToken: undefined, refreshToken: undefined, error: 'RefreshTokenError' }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        // Pasar JWT del backend a la sesión. El refresh token NO: la sesión la
        // lee el JavaScript del navegador y el refresh vale 7 días. Solo lo usa
        // el servidor, que lo tiene en el JWT cifrado de la cookie (R2, 2026-09-29).
        if (token.accessToken) {
          session.accessToken = token.accessToken
        }
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
}
