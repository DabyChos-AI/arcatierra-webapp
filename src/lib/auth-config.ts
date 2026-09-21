/**
 * NextAuth Configuration
 * Configuración de autenticación para Arca Tierra
 */

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { API_URL } from '@/lib/api'

// Función para renovar tokens usando el refresh_token
async function refreshAccessToken(token: any) {
  try {
    const backendUrl = API_URL
    
    const response = await fetch(`${backendUrl}/api/auth/refresh?refresh_token=${encodeURIComponent(token.refreshToken)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const backendUrl = API_URL
          
          // Llamar al backend /api/auth/login
          const formData = new URLSearchParams()
          formData.append('username', credentials.email)
          formData.append('password', credentials.password)
          
          const response = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
          })

          if (!response.ok) {
            console.error('Login failed:', await response.text())
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
      // Redirigir al dashboard personal después de login
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/usuario/dashboard`
      }
      // Si ya es una URL del dashboard personal, permitirla
      if (url.startsWith(`${baseUrl}/usuario/dashboard`)) {
        return url
      }
      // Para otras URLs, redirigir al dashboard personal
      return `${baseUrl}/usuario/dashboard`
    },
    async signIn({ user, account, profile }) {
      // Cuando un usuario se registra con Google, guardarlo en BD
      if (account?.provider === 'google' && user.email) {
        try {
          const backendUrl = API_URL
          
          // Verificar si el usuario ya existe
          const checkResponse = await fetch(`${backendUrl}/api/auth/check-email?email=${encodeURIComponent(user.email)}`)
          
          if (checkResponse.status === 404) {
            // Usuario no existe, crearlo
            const registerResponse = await fetch(`${backendUrl}/api/auth/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
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
              console.log(`✅ Usuario Google guardado en BD: ${user.email}`)
            } else {
              // ⚠️ MEJORA: Log detallado cuando el registro falla
              const errorText = await registerResponse.text()
              console.error(`❌ Error registrando usuario Google ${user.email}:`, {
                status: registerResponse.status,
                statusText: registerResponse.statusText,
                error: errorText
              })
            }
          } else if (checkResponse.ok) {
            // Usuario existe, obtener su ID
            const userData = await checkResponse.json()
            user.id = userData.id
            
            // ✅ NUEVO: Obtener JWT para usuario OAuth existente
            try {
              const internalSecret = process.env.INTERNAL_API_SECRET || ''
              // IMPORTANTE: Codificar el secret para URL (caracteres especiales)
              const encodedSecret = encodeURIComponent(internalSecret)
              const tokenResponse = await fetch(`${backendUrl}/api/auth/oauth-token?email=${encodeURIComponent(user.email)}&internal_secret=${encodedSecret}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              })
              
              if (tokenResponse.ok) {
                const tokenData = await tokenResponse.json()
                Object.assign(user, {
                  accessToken: tokenData.access_token,
                  refreshToken: tokenData.refresh_token
                })
                console.log(`✅ JWT obtenido para usuario OAuth: ${user.email}`)
              } else {
                console.error(`⚠️ No se pudo obtener JWT para ${user.email}`)
              }
            } catch (error) {
              console.error('Error obteniendo JWT para OAuth:', error)
            }
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
        // Pasar JWT del backend a la sesión
        if (token.accessToken) {
          session.accessToken = token.accessToken
          session.refreshToken = token.refreshToken
        }
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
}
