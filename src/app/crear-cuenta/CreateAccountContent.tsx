'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, CheckCircle, XCircle, User, Mail, Lock } from 'lucide-react'
import Link from 'next/link'

export default function CreateAccountContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accountCreated, setAccountCreated] = useState(false)

  // Validaciones de contraseña
  const passwordRequirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  }

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean)
  const passwordsMatch = password === confirmPassword

  // Manejo client-side para evitar prerendering errors
  useEffect(() => {
    setMounted(true)
    const urlToken = searchParams.get('token')
    const urlEmail = searchParams.get('email')
    setToken(urlToken)
    setEmail(urlEmail)
  }, [searchParams])

  useEffect(() => {
    if (mounted && (!token || !email)) {
      router.push('/')
    }
  }, [token, email, router, mounted])

  // Loading state para evitar flash de contenido
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B15543] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isPasswordValid || !passwordsMatch) {
      setError('Por favor verifica que la contraseña cumpla todos los requisitos')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          password,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setAccountCreated(true)
      } else {
        setError(result.error || 'Error creando la cuenta')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error creando la cuenta. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (!token || !email) {
    return null
  }

  if (accountCreated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Cuenta creada exitosamente!
          </h1>
          <p className="text-gray-600 mb-6">
            Tu cuenta ha sido creada con el email <strong>{email}</strong>
          </p>
          <Link
            href="/auth/signin"
            className="w-full bg-[#B15543] text-white py-3 px-4 rounded-lg hover:bg-[#9a4a3a] transition-colors inline-block"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#B15543] rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Crear tu cuenta
          </h1>
          <p className="text-gray-600">
            Crea una contraseña para acceder a tu cuenta
          </p>
        </div>

        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Cuenta para:</span>
          </div>
          <p className="text-sm text-green-700 font-medium">{email}</p>
        </div>

        <form onSubmit={handleCreateAccount} className="space-y-6">
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crea tu contraseña"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar contraseña
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirma tu contraseña"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Requisitos de contraseña:</p>
            <div className="space-y-1">
              {Object.entries(passwordRequirements).map(([key, valid]) => {
                const labels = {
                  length: 'Mínimo 8 caracteres',
                  uppercase: 'Al menos una mayúscula',
                  lowercase: 'Al menos una minúscula',
                  number: 'Al menos un número',
                }
                return (
                  <div key={key} className="flex items-center gap-2">
                    {valid ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={`text-xs ${valid ? 'text-green-600' : 'text-gray-500'}`}>
                      {labels[key as keyof typeof labels]}
                    </span>
                  </div>
                )
              })}
              <div className="flex items-center gap-2">
                {passwordsMatch && confirmPassword ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-300" />
                )}
                <span className={`text-xs ${passwordsMatch && confirmPassword ? 'text-green-600' : 'text-gray-500'}`}>
                  Las contraseñas coinciden
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !isPasswordValid || !passwordsMatch}
            className="w-full bg-[#B15543] hover:bg-[#9a4a3a] text-white"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creando cuenta...
              </div>
            ) : (
              'Crear cuenta'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/signin" className="text-[#B15543] hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
