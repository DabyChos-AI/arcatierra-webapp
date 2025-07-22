'use client'

import React from 'react'
import { MapPin, User, Clock, Leaf, Heart, Award, TrendingUp } from 'lucide-react'
import { Product } from '@/data/productos'
import { Badge } from '@/components/ui/badge'

interface ProductTraceabilityProps {
  product: Product
  compact?: boolean
}

export default function ProductTraceability({ product, compact = false }: ProductTraceabilityProps) {
  const { trazabilidad } = product

  if (!trazabilidad) {
    return null
  }

  const { agricultor, origen, cultivo, impacto } = trazabilidad

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-[#F5F2E8] to-white p-4 rounded-xl border border-[#B15543]/20">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-[#B15543] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[#33503E] text-sm">
              {agricultor.nombre}
            </h4>
            <p className="text-xs text-gray-600 mb-1">
              {origen.region}, {origen.estado}
            </p>
            <p className="text-xs text-[#B15543] font-medium">
              {cultivo.tiempoCosecha} • {cultivo.tiempoTransporte}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header con agricultor */}
      <div className="bg-gradient-to-r from-[#33503E] to-[#B15543] text-white p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">{agricultor.nombre}</h3>
            <p className="text-white/90 text-sm">{agricultor.experiencia}</p>
            <p className="text-white/80 text-xs">{agricultor.especializacion}</p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {/* Origen y ubicación */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-[#B15543]" />
              <h4 className="font-semibold text-[#33503E]">Origen</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Región:</span>
                <span className="font-medium">{origen.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="font-medium">{origen.estado}</span>
              </div>
              {origen.altitud && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Altitud:</span>
                  <span className="font-medium">{origen.altitud}</span>
                </div>
              )}
              {origen.clima && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Clima:</span>
                  <span className="font-medium">{origen.clima}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-[#B15543]" />
              <h4 className="font-semibold text-[#33503E]">Frescura</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Cosecha:</span>
                <span className="font-medium text-green-600">{cultivo.tiempoCosecha}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transporte:</span>
                <span className="font-medium text-green-600">{cultivo.tiempoTransporte}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Temporada:</span>
                <span className="font-medium">{cultivo.temporada}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distancia:</span>
                <span className="font-medium">{impacto.kmRecorridos} km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Método de cultivo y certificaciones */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-5 h-5 text-[#B15543]" />
            <h4 className="font-semibold text-[#33503E]">Método de Cultivo</h4>
          </div>
          <div className="mb-3">
            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {cultivo.metodo}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {cultivo.certificaciones.map((cert, index) => (
              <Badge key={index} variant="outline" className="border-[#B15543] text-[#B15543]">
                <Award className="w-3 h-3 mr-1" />
                {cert}
              </Badge>
            ))}
          </div>
        </div>

        {/* Impacto social y ambiental */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-[#B15543]" />
            <h4 className="font-semibold text-[#33503E]">Impacto Regenerativo</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-[#F5F2E8] rounded-lg">
              <div className="text-[#B15543] font-bold text-lg">
                {impacto.familiasBeneficiadas}
              </div>
              <div className="text-xs text-gray-600">
                {impacto.familiasBeneficiadas === 1 ? 'Familia' : 'Familias'} beneficiadas
              </div>
            </div>
            <div className="text-center p-3 bg-[#F5F2E8] rounded-lg">
              <div className="text-[#B15543] font-bold text-lg">{impacto.kmRecorridos}</div>
              <div className="text-xs text-gray-600">km recorridos</div>
            </div>
            <div className="text-center p-3 bg-[#F5F2E8] rounded-lg">
              <div className="text-[#B15543] font-bold text-lg">
                {impacto.empleoLocal ? '✓' : '✗'}
              </div>
              <div className="text-xs text-gray-600">Empleo local</div>
            </div>
          </div>

          {/* Prácticas regenerativas */}
          <div>
            <h5 className="font-medium text-[#33503E] mb-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Prácticas regenerativas:
            </h5>
            <div className="flex flex-wrap gap-2">
              {impacto.practicasRegenerativas.map((practica, index) => (
                <Badge key={index} variant="secondary" className="bg-green-50 text-green-700">
                  {practica}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { ProductTraceability }
