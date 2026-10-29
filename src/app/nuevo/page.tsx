import type { Metadata } from 'next'
import Falta from '@/components/sitio-nuevo/Falta'

// R15 · página de muestra del link de revisión, en la dirección `/` (RUTAS_SITIO_NUEVO). Solo se ve con ARCA_SITIO_NUEVO=1.
// F0 de la cadena v2 (sesión 57, 29-oct-2026): no inventa nada (DR-8, DR-17). Dice qué es y lo que todavía no existe en ningún
// lado, con la marca «FALTA · qué · quién» (contrato v2 §7). Las marcas son SOLO las que confirmó el líder de F0 v2 (C14, C8 y
// C11 de ~/expedientes/arcatierra/fases/R15-cadena-preguntas.md); fotos, textos, cifras y letras ya existen o ya se decidieron, así
// que no llevan marca. Usa clases que ya existen en tailwind.config.ts (el diseño base del sitio nuevo es de F1).
// La portada nueva la reemplaza cuando su fase la construya.

export const metadata: Metadata = {
  title: { absolute: 'Sitio nuevo de Arca Tierra · link de revisión' },
}

export default function SitioNuevoMuestra() {
  return (
    <main data-testid="sitio-nuevo-muestra" className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="font-sn-titulos text-3xl font-normal text-sn-ink sm:text-4xl">Sitio nuevo de Arca Tierra · link de revisión</h1>

      <p className="mt-4 text-base leading-relaxed">
        Aquí se va armando el sitio nuevo con el diseño de la maqueta de la diseñadora. Los textos, las fotos y los precios salen
        del sitio de hoy y de la base. Las direcciones que todavía no se rehacen siguen mostrando la página de hoy.
      </p>

      <h2 className="mb-0 mt-10 font-sn-titulos text-2xl font-normal text-sn-ink">Lo que todavía falta</h2>

      <ul data-testid="sitio-nuevo-faltantes" className="mt-4 list-disc space-y-3 pl-5 leading-relaxed">
        <li>
          <Falta que="visto bueno del Nivel 1 de la maqueta" quien="Lucio y Pablo" />
        </li>
        <li>
          <Falta que="cuáles son los 10 estados" quien="Lucio y Pablo" />
        </li>
        <li>
          <Falta
            que="si sus 5 tipos de evento reemplazan o se suman a los de la maqueta"
            quien="Encargadas de Experiencias"
          />
        </li>
      </ul>
    </main>
  )
}
