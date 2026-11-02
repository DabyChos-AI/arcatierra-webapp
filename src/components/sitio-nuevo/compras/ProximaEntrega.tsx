// R15 v2 · F6 (compras, sesión 64): DR-18 en Mi cuenta (`DECISIONES.md` DR-18; REGLAS-DEL-NEGOCIO §2; contrato v2 D-F6-06, D-F6-08 P-5, P-6, P-8).
// Por cada suscripción activa con su próxima canasta en `GET /api/subscriptions/extras-disponibles`: hasta cuándo se le pueden agregar productos
// (`ultimo_dia_para_pagar`, 2 días hábiles, lo calcula la API) y el botón a la pestaña de extras de la tienda nueva. Si la API dice que ya cerró
// (`abierta: false`), el texto de hoy de ese caso (`ui/ConMiCanasta.tsx:83-84`) y el botón desactivado. El descuento del envío de la canasta
// (−$100) no existe en la API: marca C51 a David, letra por letra la de `sitio-nuevo/tienda/AgregaExtras.tsx:153`, una por bloque abierto.
// La usa Mis suscripciones y la importa el Resumen de cuenta con su propia base de testids (`sn-mi-cuenta-entrega`).
import type { CanastaExtras } from '@/components/ui/ConMiCanasta'
import { fechaLarga } from '@/app/usuario/suscripciones/normalizar'
import Falta from '@/components/sitio-nuevo/Falta'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import { HREF_AGREGAR_EXTRAS } from './compras'

/** Lo que se sabe de la próxima canasta de UNA suscripción activa. */
export type EstadoEntrega =
  | { fase: 'cargando' }
  | { fase: 'error'; detalle: string }
  | { fase: 'listo'; entrega: CanastaExtras }

type Props = {
  suscripcionId: string
  estado: EstadoEntrega
  /** Vuelve a pedir `extras-disponibles` (en error). */
  onReintentar: () => void
  /** Base de los testids: `sn-mis-suscripciones-entrega` aquí, `sn-mi-cuenta-entrega` en el Resumen (D-F6-08 P-8). */
  testId: string
}

// Texto de respaldo del error: el `detail` del 500 de la API (`routers/subscriptions.py:322`).
const TEXTO_ERROR_ENTREGA = 'No se pudo consultar tu próxima canasta. Intenta de nuevo.'

export default function ProximaEntrega({ suscripcionId, estado, onReintentar, testId }: Props) {
  if (estado.fase === 'cargando') {
    return (
      <p data-testid={`${testId}-cargando`} data-suscripcion-id={suscripcionId} aria-busy="true" className="m-0 font-sn-texto text-sn-cuerpo-sm text-sn-ink">
        Cargando...
      </p>
    )
  }
  if (estado.fase === 'error') {
    return (
      <div data-testid={`${testId}-error`} data-suscripcion-id={suscripcionId} className="flex flex-wrap items-center gap-4">
        <AvisoEnLinea tono="error">{estado.detalle || TEXTO_ERROR_ENTREGA}</AvisoEnLinea>
        <Boton variante="texto" tamano="chico" onClick={onReintentar} testId={`${testId}-reintentar`}>
          Intentar de nuevo
        </Boton>
      </div>
    )
  }
  const { entrega } = estado
  return (
    <div
      data-testid={testId}
      data-suscripcion-id={suscripcionId}
      data-fecha={entrega.fecha_entrega}
      data-ultimo-dia={entrega.ultimo_dia_para_pagar}
      data-abierta={entrega.abierta ? 'true' : 'false'}
      className="flex flex-col items-start gap-3"
    >
      {entrega.abierta ? (
        <Texto tamano="chico" peso="normal" testId={`${testId}-hasta`}>
          Puedes agregar productos a esta entrega hasta el {fechaLarga(entrega.ultimo_dia_para_pagar)}
        </Texto>
      ) : (
        <Texto tamano="chico" peso="normal" testId={`${testId}-cerrada`}>
          Ya cerró el plazo para agregar a tu canasta del {fechaLarga(entrega.fecha_entrega)}: se paga a más tardar 2 días hábiles antes. Puedes
          comprar con envío normal.
        </Texto>
      )}
      <Boton href={HREF_AGREGAR_EXTRAS} deshabilitado={!entrega.abierta} variante="contorno" tamano="chico" testId={`${testId}-agregar`}>
        Agregar productos a esta entrega
      </Boton>
      {entrega.abierta && (
        <p className="m-0 font-sn-texto text-sn-cuerpo-xs">
          <Falta que="descuento del envío de la canasta al llegar a $1,000 con extras" quien="David" />
        </p>
      )}
    </div>
  )
}
