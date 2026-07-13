'use client'

import { useState } from 'react'
import { Truck, Store, CheckCircle } from 'lucide-react'

// Dirección de la matriz (sincronizado con PostalCodeSelector.tsx y backend)
const DIRECCION_MATRIZ = {
  calle: 'Calle Gobernador Antonio Díez de Bonilla #37',
  colonia: 'San Miguel Chapultepec',
  cp: '11850',
  ciudad: 'CDMX',
  horario: 'Lun, Mié, Vie: 10am - 5pm'
}

interface DeliveryTypeSelectorProps {
  value: 'envio_domicilio' | 'recoger_almacen'
  onChange: (tipo: 'envio_domicilio' | 'recoger_almacen') => void
  subtotal: number  // Solo productos, NO experiencias
  minimoEnvioGratis?: number  // Default: $1,000
  costoEnvio?: number
  disabled?: boolean
}

export default function DeliveryTypeSelector({
  value,
  onChange,
  subtotal,
  minimoEnvioGratis = 1000,  // SIEMPRE $1,000 para envío gratis
  costoEnvio = 100,
  disabled = false
}: DeliveryTypeSelectorProps) {
  
  // Calcular si aplica envío gratis
  const envioGratis = subtotal >= minimoEnvioGratis
  const costoEnvioFinal = value === 'recoger_almacen' ? 0 : (envioGratis ? 0 : costoEnvio)
  const faltaParaGratis = minimoEnvioGratis - subtotal

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">¿Cómo deseas recibir tu pedido?</h3>
      
      {/* Opción: Envío a domicilio */}
      <label 
        className={`
          flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
          ${value === 'envio_domicilio' 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-200 hover:border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          type="radio"
          name="tipo_entrega"
          value="envio_domicilio"
          checked={value === 'envio_domicilio'}
          onChange={() => !disabled && onChange('envio_domicilio')}
          disabled={disabled}
          className="sr-only"
        />
        
        <div className={`
          w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center
          ${value === 'envio_domicilio' ? 'border-green-500' : 'border-gray-300'}
        `}>
          {value === 'envio_domicilio' && (
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          )}
        </div>
        
        <Truck className="w-5 h-5 text-green-600 mr-3" />
        
        <div className="flex-1">
          <span className="font-medium text-gray-900">Envío a domicilio</span>
          {value === 'envio_domicilio' && (
            <div className="text-sm mt-1">
              {envioGratis ? (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> ¡Envío GRATIS!
                </span>
              ) : (
                <span className="text-gray-600">
                  Envío: ${costoEnvio} 
                  {faltaParaGratis > 0 && (
                    <span className="text-amber-600 ml-2">
                      (Agrega ${faltaParaGratis.toFixed(0)} más para envío gratis)
                    </span>
                  )}
                </span>
              )}
            </div>
          )}
        </div>
        
        <span className={`font-semibold ${envioGratis ? 'text-green-600' : 'text-gray-900'}`}>
          {value === 'envio_domicilio' ? (envioGratis ? 'Gratis' : `+$${costoEnvio}`) : ''}
        </span>
      </label>

      {/* Opción: Recoger en almacén */}
      <label 
        className={`
          flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all
          ${value === 'recoger_almacen' 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-200 hover:border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          type="radio"
          name="tipo_entrega"
          value="recoger_almacen"
          checked={value === 'recoger_almacen'}
          onChange={() => !disabled && onChange('recoger_almacen')}
          disabled={disabled}
          className="sr-only"
        />
        
        <div className={`
          w-5 h-5 rounded-full border-2 mr-4 mt-0.5 flex items-center justify-center
          ${value === 'recoger_almacen' ? 'border-green-500' : 'border-gray-300'}
        `}>
          {value === 'recoger_almacen' && (
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          )}
        </div>
        
        <Store className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">Recoger en almacén</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Sin costo
            </span>
          </div>
          
          {value === 'recoger_almacen' && (
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <p>📍 {DIRECCION_MATRIZ.calle}, {DIRECCION_MATRIZ.colonia}</p>
              <p>🕐 {DIRECCION_MATRIZ.horario}</p>
            </div>
          )}
        </div>
        
        <span className="font-semibold text-green-600">$0</span>
      </label>
    </div>
  )
}
