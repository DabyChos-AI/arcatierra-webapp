'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Package, Plus, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { API_URL } from '@/lib/api'

interface Subscription {
  id: string
  nombre_suscripcion: string
  precio_base: number
  mp_next_payment_date: string | null
}

interface AddToSubscriptionButtonProps {
  cartItems: any[]
  onSuccess?: () => void
}

export default function AddToSubscriptionButton({ cartItems, onSuccess }: AddToSubscriptionButtonProps) {
  const { data: session } = useSession()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSub, setSelectedSub] = useState<string | null>(null)
  const [resumen, setResumen] = useState<any>(null)

  const BACKEND_URL = API_URL

  // Verificar si el usuario tiene suscripciones activas
  useEffect(() => {
    const checkSubscriptions = async () => {
      if (!session?.user) {
        setChecking(false)
        return
      }

      try {
        const response = await fetch(`${BACKEND_URL}/api/subscriptions/mis-suscripciones`, {
          headers: {
            'Authorization': `Bearer ${(session as any).accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          const activas = data.suscripciones?.filter((s: any) => s.estado === 'activa') || []
          setSubscriptions(activas)
          if (activas.length === 1) {
            setSelectedSub(activas[0].id)
          }
        }
      } catch (err) {
        console.error('Error checking subscriptions:', err)
      } finally {
        setChecking(false)
      }
    }

    checkSubscriptions()
  }, [session])

  const handleAddToSubscription = async () => {
    if (!selectedSub || !session) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${BACKEND_URL}/api/subscriptions/${selectedSub}/agregar-carrito`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(session as any).accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: cartItems })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        setResumen(data.resumen)
        onSuccess?.()
      } else {
        setError(data.detail || 'Error al agregar productos')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  // No mostrar si está cargando o no hay suscripciones
  if (checking) return null
  if (subscriptions.length === 0) return null
  if (cartItems.length === 0) return null

  // Calcular subtotal de productos (no experiencias)
  const subtotalProductos = cartItems
    .filter((item: any) => item.tipo !== 'experiencia')
    .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)

  if (subtotalProductos === 0) return null

  // Estado de éxito
  if (success && resumen) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 text-green-700 mb-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold">¡Productos agregados a tu suscripción!</span>
        </div>
        <div className="text-sm text-green-600 space-y-1">
          <p>📦 {resumen.productos_agregados} productos agregados</p>
          <p>💰 Total extra: ${resumen.total_productos_extra.toFixed(2)}</p>
          <p>📅 Se cobrarán en tu próxima entrega</p>
          {resumen.envio_gratis && (
            <p className="font-medium">🎉 ¡Envío GRATIS por llegar a $1,000!</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 text-amber-700 mb-3">
        <Package className="w-5 h-5" />
        <span className="font-semibold">¿Tienes suscripción activa?</span>
      </div>
      
      <p className="text-sm text-amber-600 mb-3">
        Agrega estos productos a tu próxima entrega de suscripción. 
        Se cobrarán junto con tu canasta.
        {subtotalProductos > 0 && subscriptions[0]?.precio_base && (
          <span className="block mt-1">
            💡 Canasta (${subscriptions[0].precio_base}) + Productos (${subtotalProductos.toFixed(2)}) = 
            <strong> ${(subscriptions[0].precio_base + subtotalProductos).toFixed(2)}</strong>
            {subscriptions[0].precio_base + subtotalProductos >= 1000 && (
              <span className="text-green-600 font-medium"> → ¡Envío GRATIS!</span>
            )}
          </span>
        )}
      </p>

      {subscriptions.length > 1 && (
        <select 
          value={selectedSub || ''} 
          onChange={(e) => setSelectedSub(e.target.value)}
          className="w-full p-2 border rounded-lg mb-3 text-sm"
        >
          <option value="">Selecciona tu suscripción</option>
          {subscriptions.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.nombre_suscripcion} - ${sub.precio_base}
            </option>
          ))}
        </select>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <Button
        onClick={handleAddToSubscription}
        disabled={loading || !selectedSub}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Agregando...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Agregar a mi próxima entrega
          </>
        )}
      </Button>
    </div>
  )
}
