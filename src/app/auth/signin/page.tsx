'use client'

import { signIn, getSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { aviso } from '@/components/ui/Avisos'

export default function SignIn() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [errorLogin, setErrorLogin] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push(destinoTrasLogin())
      }
    }
    checkSession()
  }, [router])

  /**
   * A dónde mandar al usuario después de entrar.
   * El middleware agrega ?callbackUrl=… cuando rebota a alguien de una ruta
   * protegida, así que respetarlo devuelve a la persona a donde iba (por
   * ejemplo /admin/reportes) en vez de tirarla siempre al dashboard.
   */
  const destinoTrasLogin = () => {
    if (typeof window === 'undefined') return '/dashboard'
    const cb = new URLSearchParams(window.location.search).get('callbackUrl')
    if (!cb) return '/dashboard'
    try {
      // Solo rutas de este mismo sitio: un callbackUrl externo sería un
      // redirect abierto.
      const url = new URL(cb, window.location.origin)
      return url.origin === window.location.origin ? url.pathname + url.search : '/dashboard'
    } catch {
      return '/dashboard'
    }
  }

  /**
   * Login con correo y contraseña.
   *
   * El proveedor `credentials` de NextAuth ya existía y funciona (llama a
   * /api/auth/login del backend), pero NINGUNA pantalla lo usaba: el formulario
   * solo se renderizaba en modo "Crear Cuenta". Resultado: quien no tuviera
   * Google no podía entrar al panel de administración.
   */
  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorLogin(null)
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email: formData.email.trim(),
        password: formData.password,
        redirect: false,
      })
      if (res?.ok) {
        router.push(destinoTrasLogin())
        router.refresh()
      } else {
        setErrorLogin('Correo o contraseña incorrectos.')
      }
    } catch {
      setErrorLogin('No se pudo conectar. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: true 
      })
    } catch (error) {
      console.error('Error signing in:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      aviso.error('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    // Antes esto era un setTimeout que anunciaba "¡Cuenta creada!" sin llamar a
    // nadie: la persona leia el exito, intentaba entrar y no podia. La ruta
    // /api/auth/create-account ya existia y hace el alta contra el backend.
    try {
      const res = await fetch('/api/auth/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nombre: formData.name,
        }),
      })
      const datos = await res.json().catch(() => ({}))

      if (!res.ok) {
        aviso.error(datos.error || 'No se pudo crear la cuenta. Intenta de nuevo.')
        return
      }

      aviso.exito('¡Cuenta creada! Ahora puedes iniciar sesión')
      setIsSignUp(false)
    } catch {
      aviso.error('Sin conexión con el servidor. Revisa tu internet e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3DBCB] to-[#CCBB9A] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-[#33503E] to-[#2D4536] rounded-full flex items-center justify-center shadow-lg">
              <div className="text-center">
                <span className="text-white text-2xl font-bold tracking-wider">AT</span>
                <div className="w-6 h-0.5 bg-[#B15543] mx-auto mt-1 rounded"></div>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#B15543] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">🌱</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#33503E] mb-2">Arca Tierra</h1>
          <p className="text-gray-600">
            {isSignUp ? 'Crea tu cuenta para comenzar' : 'Inicia sesión para continuar'}
          </p>
        </div>

        {/* Toggle entre Login y Signup */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              !isSignUp 
                ? 'bg-white text-[#33503E] shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              isSignUp 
                ? 'bg-white text-[#33503E] shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        <div className="space-y-4">
          {/* Login con correo y contraseña — es la única vía para las cuentas
              de staff que no usan Google (el panel admin depende de esto). */}
          {!isSignUp && (
            <form onSubmit={handleCredentialsSignIn} className="space-y-4 mb-6">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#33503E] focus:border-transparent"
                  placeholder="tu@correo.com"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#33503E] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              {errorLogin && (
                <p role="alert" className="text-sm text-[#DC2626] bg-[#FEE2E2] rounded-lg px-3 py-2">
                  {errorLogin}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#33503E] text-white rounded-lg py-2.5 font-medium transition-colors hover:bg-[#2D4536] disabled:opacity-60"
              >
                {loading ? 'Entrando…' : 'Iniciar sesión'}
              </button>

              <div className="flex items-center gap-3 pt-2">
                <span className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-500">o continúa con</span>
                <span className="h-px flex-1 bg-gray-200" />
              </div>
            </form>
          )}

          {/* Formulario Manual - Solo en modo Signup */}
          {isSignUp && (
            <form onSubmit={handleSignUp} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#33503E] focus:border-transparent"
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#33503E] focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#33503E] focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#33503E] focus:border-transparent"
                  placeholder="Confirma tu contraseña"
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#33503E] text-white hover:bg-[#2D4536] transition-all duration-200 py-3 px-4 rounded-lg flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    🌱 Crear Cuenta
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Separador - Solo mostrar si hay formulario manual */}
          {isSignUp && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">o continúa con</span>
              </div>
            </div>
          )}

          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 py-3 px-4 rounded-lg flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </>
            )}
          </Button>

          {/* A2b (R6, DR18): sin Facebook ni Instagram (eran alert «próximamente»); queda Google */}
          {/* Continuar sin cuenta */}
          <Button
            onClick={() => router.push('/suscripciones')}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 py-3 px-4 rounded-lg"
          >
            Continuar sin cuenta
          </Button>

          <div className="text-center text-sm text-gray-500 mt-6">
            Al iniciar sesión, aceptas nuestros{' '}
            <a href="/terminos" className="text-[#B15543] hover:underline">
              Términos de Servicio
            </a>{' '}
            y{' '}
            <a href="/privacidad" className="text-[#B15543] hover:underline">
              Política de Privacidad
            </a>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            {isSignUp ? (
              <>
                ¿Ya tienes cuenta?{' '}
                <button 
                  onClick={() => setIsSignUp(false)}
                  className="text-[#B15543] font-medium hover:underline"
                >
                  Inicia sesión aquí
                </button>
              </>
            ) : (
              <>
                ¿Eres nuevo en Arca Tierra?{' '}
                <button 
                  onClick={() => setIsSignUp(true)}
                  className="text-[#B15543] font-medium hover:underline"
                >
                  Crea tu cuenta
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

