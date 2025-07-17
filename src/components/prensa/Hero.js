'use client'

import { pressStats } from '@/data/prensa/pressData'

export default function Hero({ title = "PRENSA", subtitle = "El interés en Arca Tierra trasciende fronteras. Explora todas las menciones y artículos en medios nacionales e internacionales sobre nuestro proyecto de agricultura sostenible en Xochimilco." }) {
  return (
    <section className="hero-gradient py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Título principal */}
          <h1 className="hero-title text-4xl lg:text-6xl font-bold text-terracota mb-6 fade-in">
            {title}
          </h1>
          
          {/* Descripción */}
          <p className="hero-description text-lg lg:text-xl text-principal max-w-4xl mx-auto mb-12 fade-in-delay">
            {subtitle}
          </p>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-lg p-6 card-shadow fade-in">
              <div className="text-3xl lg:text-4xl font-bold text-terracota mb-2">
                {pressStats.total}
              </div>
              <div className="text-sm lg:text-base text-secundario font-medium">
                Menciones Totales
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 card-shadow fade-in">
              <div className="text-3xl lg:text-4xl font-bold text-verde-arca mb-2">
                {pressStats.nacional}
              </div>
              <div className="text-sm lg:text-base text-secundario font-medium">
                Medios Nacionales
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 card-shadow fade-in">
              <div className="text-3xl lg:text-4xl font-bold text-terracota mb-2">
                {pressStats.internacional}
              </div>
              <div className="text-sm lg:text-base text-secundario font-medium">
                Medios Internacionales
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 card-shadow fade-in">
              <div className="text-3xl lg:text-4xl font-bold text-verde-arca mb-2">
                {pressStats.countries || 8}
              </div>
              <div className="text-sm lg:text-base text-secundario font-medium">
                Países
              </div>
            </div>
          </div>

          {/* Divisor gráfico */}
          <div className="flex justify-center mb-12">
            <div className="w-24 h-1 bg-terracota rounded"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
