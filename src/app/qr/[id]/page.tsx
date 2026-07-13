'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, QrCode, Clock, MapPin, Loader2, AlertTriangle } from 'lucide-react'
import { API_URL } from '@/lib/api'

interface QRCodigoDetalle {
  id: string
  codigo: string
  tipo: string
  experiencia_id?: number
  reserva_id?: string
  valido_desde: string
  valido_hasta: string
  usos_maximos: number
  usos_realizados: number
  activo: boolean
  metadata?: Record<string, any>
}

interface QRValidationResult {
  valid: boolean
  codigo?: QRCodigoDetalle
  message: string
  timestamp: string
  validacion_id?: string
}

export default function QRVerificationPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [validation, setValidation] = useState<QRValidationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [usingAPI, setUsingAPI] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const qrId = params.id as string
  const code = searchParams.get('code')
  const hash = searchParams.get('hash')

  useEffect(() => {
    const validateQR = async () => {
      try {
        setLoading(true)
        setApiError(null)
        
        console.log(`🔍 Validando QR - ID: ${qrId}, Code: ${code}, Hash: ${hash}`);
        
        // ✅ PRIORIDAD 1: Validación real desde API
        const apiUrl = `${API_URL}/api/qr/${qrId}/validate?code=${encodeURIComponent(code || '')}&hash=${encodeURIComponent(hash || '')}`;
        const response = await fetch(apiUrl);
        
        if (response.ok) {
          const realValidation: QRValidationResult = await response.json();
          setValidation(realValidation);
          setUsingAPI(true);
          console.log('✅ Validación cargada desde API:', realValidation.valid ? 'VÁLIDO' : 'INVÁLIDO');
        } else {
          const errorData = await response.json().catch(() => ({ detail: 'Error desconocido' }));
          throw new Error(`API respondió con ${response.status}: ${errorData.detail || 'Error desconocido'}`);
        }
      } catch (error) {
        console.warn('⚠️ API no disponible, usando fallback simulado:', error);
        setApiError(error instanceof Error ? error.message : 'Error desconocido');
        
        // ✅ FALLBACK: Simulación temporal para desarrollo
        const mockValidation: QRValidationResult = {
          valid: true,
          codigo: {
            id: qrId,
            codigo: code || '',
            tipo: 'experiencia',
            experiencia_id: 1,
            valido_desde: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            valido_hasta: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            usos_maximos: 1,
            usos_realizados: 0,
            activo: true,
            metadata: {}
          },
          message: 'Código QR válido (simulado - API no disponible)',
          timestamp: new Date().toISOString()
        };
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setValidation(mockValidation);
        setUsingAPI(false);
      } finally {
        setLoading(false);
      }
    };

    if (qrId && code && hash) {
      validateQR()
    } else {
      setValidation({
        valid: false,
        message: 'Código QR incompleto o inválido',
        timestamp: new Date().toISOString()
      })
      setLoading(false)
    }
  }, [qrId, code, hash])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Validando código QR...</h2>
          <p className="text-gray-600">Por favor espera mientras verificamos tu código</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            validation?.valid ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {validation?.valid ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          
          <h1 className={`text-2xl font-bold mb-2 ${
            validation?.valid ? 'text-green-900' : 'text-red-900'
          }`}>
            {validation?.valid ? '¡Código Válido!' : 'Código Inválido'}
          </h1>
          
          <p className={`text-sm ${
            validation?.valid ? 'text-green-700' : 'text-red-700'
          }`}>
            {validation?.message}
          </p>
          
          {/* Badge informativo API vs Mock */}
          <div className="mt-3 inline-flex items-center">
            {usingAPI ? (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Validación Real
              </span>
            ) : (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Simulado {apiError && '(API no disponible)'}
              </span>
            )}
          </div>
        </div>

        {validation?.valid && validation.codigo && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center">
                  <QrCode className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium">Código:</span>
                  <span className="ml-1 font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                    {validation.codigo.codigo}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium">Tipo:</span>
                  <span className="ml-1 capitalize">{validation.codigo.tipo}</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium">Válido hasta:</span>
                  <span className="ml-1">
                    {new Date(validation.codigo.valido_hasta).toLocaleString('es-MX')}
                  </span>
                </div>
                
                {/* Mostrar información de usos si está disponible */}
                {validation.codigo.usos_maximos && (
                  <div className="flex items-center">
                    <span className="font-medium">Usos:</span>
                    <span className="ml-1">
                      {validation.codigo.usos_realizados} / {validation.codigo.usos_maximos}
                      {validation.codigo.usos_realizados >= validation.codigo.usos_maximos && (
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Agotado</span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">¡Bienvenido a Arcatierra!</h3>
              <p className="text-green-700 text-sm">
                Tu código QR ha sido verificado exitosamente. Puedes proceder con tu experiencia.
              </p>
            </div>

            <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
              Continuar con la experiencia
            </button>
          </div>
        )}

        {!validation?.valid && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">Código no válido</h3>
            <p className="text-red-700 text-sm mb-4">
              Este código QR no es válido, ha expirado o ya fue utilizado.
            </p>
            <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
              Contactar soporte
            </button>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <a 
            href="https://arcatierra.dabychos.com" 
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            ← Volver a Arcatierra
          </a>
        </div>
      </div>
    </div>
  )
}
