import { Check } from 'lucide-react'
import { unirClases } from '@/components/sitio-nuevo/ui/clases'

// R15 v2 · F6 (cuenta, sesión 64): las preferencias de Datos en modo «ver». Hoy son casillas deshabilitadas (`usuario/perfil/page.tsx:576-626`,
// `disabled={!editing}`) y `ui/Casilla` no tiene `disabled`: esta es una casilla nativa deshabilitada con el MISMO dibujo de `ui/Casilla`
// (16 px, borde ink, marcada en terra con la palomita blanca) para que el lector de pantalla diga «marcada/no marcada, no disponible», como
// hoy. Sin texto propio: la etiqueta la pasa quien la usa.

type Props = { marcada: boolean; children: React.ReactNode; ayuda?: string; id: string }

export default function CasillaFija({ marcada, children, ayuda, id }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex min-h-6 items-start gap-2.5">
        <span className="relative mt-[3px] flex h-4 w-4 shrink-0">
          <input
            id={id}
            type="checkbox"
            checked={marcada}
            readOnly
            disabled
            aria-describedby={ayuda ? `${id}-ayuda` : undefined}
            className={unirClases(
              'peer m-0 h-4 w-4 appearance-none rounded-[4px] border border-solid border-sn-ink bg-transparent',
              'checked:border-sn-terra checked:bg-sn-terra',
            )}
          />
          <Check
            aria-hidden="true"
            focusable="false"
            strokeWidth={3}
            className="pointer-events-none absolute inset-0 m-auto hidden h-3 w-3 text-white peer-checked:block"
          />
        </span>
        <label htmlFor={id} className="font-sn-texto text-sn-cuerpo-xs font-normal text-sn-ink">
          {children}
        </label>
      </div>
      {ayuda && (
        <p id={`${id}-ayuda`} className="m-0 pl-[26px] font-sn-texto text-sn-cuerpo-xs font-normal text-sn-ink">
          {ayuda}
        </p>
      )}
    </div>
  )
}
