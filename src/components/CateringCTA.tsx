import Link from 'next/link';
import { ArrowRight, Utensils, MapPin, Sparkles } from 'lucide-react';

export default function CateringCTA() {
  return (
    <div className="relative my-20 mx-4 md:mx-8 rounded-3xl overflow-hidden shadow-2xl">
      {/* Fondo con gradiente mejorado */}
      <div className="absolute inset-0 bg-gradient-to-br from-terracota-600 via-terracota-500 to-orange-500" />
      
      {/* Patrón decorativo sutil */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Efectos decorativos */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 blur-xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16 blur-xl" />

      <div className="relative z-10 px-8 py-16 md:py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Icono principal con animación */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-8 animate-pulse">
            <Utensils className="w-12 h-12 text-white" />
          </div>

          {/* Título principal */}
          <h2 className="text-4xl md:text-6xl font-playfair font-bold text-white mb-6 leading-tight">
            ¿Quieres una experiencia fuera de las chinampas?
          </h2>

          {/* Subtítulo */}
          <p className="text-xl md:text-2xl text-white/90 mb-10 font-light max-w-3xl mx-auto">
            Llevamos nuestras experiencias gastronómicas a tu evento especial
          </p>

          {/* Características destacadas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-3 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <MapPin className="w-8 h-8 text-white" />
              <span className="text-white font-semibold">En tu ubicación</span>
              <span className="text-white/80 text-sm text-center">Llevamos la experiencia donde tú quieras</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <Utensils className="w-8 h-8 text-white" />
              <span className="text-white font-semibold">Cocina tradicional</span>
              <span className="text-white/80 text-sm text-center">Auténticos sabores mexicanos</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <Sparkles className="w-8 h-8 text-white" />
              <span className="text-white font-semibold">Ingredientes frescos</span>
              <span className="text-white/80 text-sm text-center">Directo de nuestras chinampas</span>
            </div>
          </div>

          {/* Botón principal mejorado */}
          <div className="mb-8">
            <Link href="/catering">
              <button className="group inline-flex items-center gap-4 bg-white text-terracota-600 px-10 py-5 rounded-full font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <span className="group-hover:scale-105 transition-transform duration-300">
                  Conocer Catering
                </span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </button>
            </Link>
          </div>

          {/* Información adicional */}
          <div className="text-white/80 text-lg">
            <p className="mb-2">Perfecto para:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/20 px-4 py-2 rounded-full">Bodas</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Eventos corporativos</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Celebraciones privadas</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Talleres</span>
            </div>
          </div>
        </div>
      </div>

      {/* Efecto de brillo animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform skew-x-12 animate-pulse" />
    </div>
  );
}

