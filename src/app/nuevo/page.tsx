import type { Metadata } from 'next'
import Falta from '@/components/sitio-nuevo/Falta'

// R15 · F0 (sesión 53, 28-oct-2026): página de muestra del link de revisión, en la dirección `/` (RUTAS_SITIO_NUEVO).
// No inventa nada: solo dice qué es y lo que falta para construir el sitio, con la marca «FALTA · qué · quién» (§4).
// La portada nueva (WF2) la reemplaza en F2.

export const metadata: Metadata = {
  title: { absolute: 'Sitio nuevo de Arca Tierra · link de revisión' },
}

export default function SitioNuevoMuestra() {
  return (
    <main data-testid="sitio-nuevo-muestra" className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="font-mendoza text-3xl text-verde sm:text-4xl">Sitio nuevo de Arca Tierra · link de revisión</h1>

      <p className="mt-4 text-base leading-relaxed">
        Aquí se va armando el sitio nuevo según la maqueta de la diseñadora. La portada nueva llega en la fase F2.
      </p>

      <h2 className="mt-10 font-mendoza text-2xl text-verde">Lo que todavía falta para construirlo</h2>

      <ul data-testid="sitio-nuevo-faltantes" className="mt-4 list-disc space-y-3 pl-5 leading-relaxed">
        <li>
          <Falta
            que="visto bueno del Nivel 1 de la maqueta (cómo se compra, se reserva y se navega)"
            quien="Lucio y Pablo"
          />
        </li>
        <li>
          <Falta que="cifras con fuente: familias, estados, años y colonias" quien="Lucio y Pablo" />
        </li>
        <li>
          <Falta
            que="tipos de evento, servicios y horarios del cotizador"
            quien="Encargadas de Experiencias"
          />
        </li>
        <li>
          <Falta que="maqueta corregida: precios, fechas y textos" quien="Diseñadora" />
        </li>
        <li>
          <Falta
            que="decisión de las fuentes: comprar Cahuenga y Akkurat o usar las libres"
            quien="Lucio y Pablo"
          />
        </li>
      </ul>

      <div className="mt-10">
        <Falta como="bloque" que="fotos de la portada" quien="Diseñadora" />
      </div>
    </main>
  )
}
