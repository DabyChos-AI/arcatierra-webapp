'use client'

import { useState, useEffect } from 'react'
import { QrCode, Plus, Download, Eye, Settings, X } from 'lucide-react'
import QRCodeLib from 'qrcode'
import { formatFechaHoraMexico } from '@/lib/dates'

interface QRGenerateRequest {
  experiencia_id?: number;
  cantidad: number;
  tipo: string;
  valido_horas: number;
}

interface QRCode {
  id: string;
  codigo: string;
  hash: string;
  valido_hasta: string;
  tipo: string;
}

export default function QRCodesPage() {
  // DEBUG: Timestamp para verificar que el archivo se actualiza
  console.log('🔄 QRCodesPage cargado:', new Date().toISOString())
  
  const [codigos, setCodigos] = useState<QRCode[]>([])
  const [generating, setGenerating] = useState(false)
  const [cantidad, setCantidad] = useState(1)
  const [tipo, setTipo] = useState('experiencia')
  const [validoHoras, setValidoHoras] = useState(24)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedQR, setSelectedQR] = useState<QRCode | null>(null)
  const [qrImageUrl, setQrImageUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // 🆕 CARGAR CÓDIGOS EXISTENTES AL MONTAR COMPONENTE
  useEffect(() => {
    const fetchExistingCodes = async () => {
      try {
        const response = await fetch('/api/admin/qr/list')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setCodigos(data.codigos || [])
            console.log(`✅ Cargados ${data.total} códigos QR existentes`)
          }
        }
      } catch (error) {
        console.error('⚠️ Error cargando códigos existentes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchExistingCodes()
  }, [])

  const handleGenerate = async () => {
    if (cantidad < 1 || cantidad > 50) {
      alert('❌ La cantidad debe estar entre 1 y 50 códigos')
      return
    }

    setGenerating(true)
    
    try {
      const response = await fetch('/api/admin/qr/generar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cantidad,
          tipo,
          valido_horas: validoHoras
        })
      })

      if (!response.ok) {
        throw new Error('Error al generar códigos QR')
      }

      const data = await response.json()
      
      if (data.success) {
        setCodigos(prev => [...data.codigos, ...prev])
        alert(`✅ ${data.cantidad} código${data.cantidad > 1 ? 's' : ''} QR generado${data.cantidad > 1 ? 's' : ''} exitosamente!`)
      } else {
        throw new Error('Error en la respuesta del servidor')
      }
      
    } catch (error: any) {
      console.error('Error:', error)
      alert('❌ Error generando códigos QR: ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  // Función para generar QR Code REAL usando librería qrcode
  const generateQRCanvas = async (text: string, size: number = 200): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas')
    
    try {
      // Generar QR code real usando la librería
      await QRCodeLib.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })
    } catch (error) {
      console.error('Error generando QR:', error)
      // Fallback a canvas en blanco si hay error
      const ctx = canvas.getContext('2d')!
      canvas.width = size
      canvas.height = size
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, size, size)
      ctx.fillStyle = '#000000'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Error QR', size/2, size/2)
    }
    
    return canvas
  }

  // Función para generar QR como URL de imagen
  const generateQRImageUrl = async (text: string, size: number = 200): Promise<string> => {
    try {
      const url = await QRCodeLib.toDataURL(text, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })
      return url
    } catch (error) {
      console.error('Error generando QR URL:', error)
      return ''
    }
  }

  // Función para crear URL escaneable desde código QR
  const createQRUrl = (codigo: QRCode): string => {
    // Crear URL que rediruja a página de verificación
    return `https://arcatierra.dabychos.com/qr/${codigo.id}?code=${codigo.codigo}&hash=${codigo.hash}`
  }

  // useEffect para generar imagen QR cuando se abre modal
  useEffect(() => {
    if (showQRModal && selectedQR) {
      const qrUrl = createQRUrl(selectedQR)
      generateQRImageUrl(qrUrl, 200).then(setQrImageUrl)
    }
  }, [showQRModal, selectedQR])

  // Función para ver QR individual
  const handleViewQR = (codigo: QRCode) => {
    console.log('👁️ handleViewQR ejecutándose para:', codigo.codigo)
    setSelectedQR(codigo)
    setShowQRModal(true)
  }

  // Función para descargar QR individual
  const handleDownloadQR = async (codigo: QRCode) => {
    console.log('⬇️ handleDownloadQR ejecutándose para:', codigo.codigo)
    const qrUrl = createQRUrl(codigo)
    const imageUrl = await generateQRImageUrl(qrUrl, 400)
    
    const link = document.createElement('a')
    link.download = `QR_${codigo.codigo}.png`
    link.href = imageUrl
    link.click()
  }

  // Función para descargar todos los QR
  const handleDownloadAll = async () => {
    console.log('🚀 handleDownloadAll ejecutándose con', codigos.length, 'códigos')
    if (codigos.length === 0) {
      alert('❌ No hay códigos QR para descargar')
      return
    }

    try {
      // Simular descarga múltiple generando un archivo de texto con los códigos
      const content = [
        '# CÓDIGOS QR GENERADOS - ARCATIERRA',
        `Fecha: ${formatFechaHoraMexico(new Date())}`,
        `Total de códigos: ${codigos.length}`,
        '',
        ...codigos.map((codigo, index) => [
          `## Código ${index + 1}`,
          `ID: ${codigo.id}`,
          `Código: ${codigo.codigo}`,
          `Hash: ${codigo.hash}`,
          `Tipo: ${codigo.tipo}`,
          `Válido hasta: ${formatFechaHoraMexico(codigo.valido_hasta)}`,
          ''
        ]).flat()
      ].join('\n')

      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `QR_Codes_${new Date().toISOString().split('T')[0]}.txt`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)

      // También descargar las imágenes individualmente
      codigos.forEach((codigo, index) => {
        setTimeout(async () => {
          await handleDownloadQR(codigo)
        }, index * 100) // Delay para evitar bloqueo
      })

      alert(`✅ Descarga iniciada!\n\n📁 Lista de códigos: QR_Codes_${new Date().toISOString().split('T')[0]}.txt\n🖼️ ${codigos.length} imágenes QR individuales\n\n💾 Revisa tu carpeta de descargas`)
      
    } catch (error) {
      console.error('Error descargando códigos:', error)
      alert('❌ Error al descargar códigos QR')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <QrCode className="h-8 w-8 text-green-600 mr-3" />
            Generador de Códigos QR
          </h1>
          <p className="text-gray-600 mt-1">Crea códigos QR para experiencias y eventos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de Generación */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generar Nuevos Códigos</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Código
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="experiencia">Experiencia</option>
                <option value="evento">Evento</option>
                <option value="promocion">Promoción</option>
                <option value="acceso">Acceso General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad de Códigos
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Válido por (horas)
              </label>
              <select
                value={validoHoras}
                onChange={(e) => setValidoHoras(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value={1}>1 hora</option>
                <option value={6}>6 horas</option>
                <option value={12}>12 horas</option>
                <option value={24}>24 horas</option>
                <option value={48}>48 horas</option>
                <option value={168}>1 semana</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {generating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Plus className="h-5 w-5" />
              )}
              <span>{generating ? 'Generando...' : 'Generar Códigos QR'}</span>
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vista Previa</h3>
          
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center mb-4">
              <QrCode className="h-16 w-16 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">
              Tipo: <span className="font-medium capitalize">{tipo}</span>
            </p>
            <p className="text-sm text-gray-600">
              Cantidad: <span className="font-medium">{cantidad}</span>
            </p>
            <p className="text-sm text-gray-600">
              Válido: <span className="font-medium">{validoHoras}h</span>
            </p>
          </div>
        </div>
      </div>

      {/* Códigos Generados */}
      {codigos.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Códigos QR Generados ({codigos.length})
            </h3>
            <button 
              onClick={handleDownloadAll}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              <span>Descargar Todos</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-3 text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando códigos QR...</p>
              </div>
            ) : codigos.length === 0 ? (
              <div className="col-span-3 text-center py-8">
                <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No hay códigos QR generados hoy</p>
                <p className="text-sm text-gray-500 mt-2">Genera tu primer código usando el formulario de arriba</p>
              </div>
            ) : codigos.map((codigo: QRCode) => (
              <div key={codigo.id} className="border border-gray-200 rounded-lg p-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center mb-3">
                  <div className="w-24 h-24 bg-white border border-gray-300 rounded mx-auto flex items-center justify-center mb-2">
                    <QrCode className="h-12 w-12 text-gray-600" />
                  </div>
                  <p className="text-xs text-gray-600 font-mono">{codigo.codigo}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Hash:</span> {codigo.hash}...
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Válido hasta:</span> {formatFechaHoraMexico(codigo.valido_hasta)}
                  </p>
                </div>

                <div className="flex space-x-2 mt-3">
                  <button 
                    onClick={() => handleViewQR(codigo)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-xs">Ver</span>
                  </button>
                  <button 
                    onClick={() => handleDownloadQR(codigo)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-xs">Descargar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <QrCode className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Códigos Generados Hoy</p>
              <p className="text-2xl font-bold text-gray-900">{codigos.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Códigos Activos</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Códigos Utilizados</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Ver QR Individual */}
      {showQRModal && selectedQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-36 px-4 pb-8 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[calc(100vh-180px)] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Código QR</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="text-center">
                {/* QR Code generado dinámicamente */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-4 inline-block">
                  {qrImageUrl ? (
                    <img 
                      src={qrImageUrl} 
                      alt="QR Code" 
                      className="w-48 h-48 object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm text-left bg-gray-50 rounded-lg p-4">
                  <p><span className="font-medium">Código:</span> {selectedQR.codigo}</p>
                  <p><span className="font-medium">ID:</span> {selectedQR.id}</p>
                  <p><span className="font-medium">Hash:</span> {selectedQR.hash}</p>
                  <p><span className="font-medium">Tipo:</span> <span className="capitalize">{selectedQR.tipo}</span></p>
                  <p><span className="font-medium">Válido hasta:</span> {formatFechaHoraMexico(selectedQR.valido_hasta)}</p>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => {
                      handleDownloadQR(selectedQR)
                      setShowQRModal(false)
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4" />
                    <span>Descargar</span>
                  </button>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
