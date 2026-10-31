'use client'

// R15 v2 · F3 (tienda): la confirmación de la suscripción del sitio nuevo. Textos y reglas de la de hoy
// (src/app/suscripciones/confirmacion/page.tsx), con lo decidido en D-F3-24:
// - T-10: `?sin_costo=1` (planes de prueba, sin MercadoPago) es una suscripción ACTIVA: aquí sale como activada con el mensaje de la API
//   (hoy dice «No se pudo procesar», `:36-43`: defecto de producción a TASK-LIST).
// - T-24: «Tu primera canasta llega el {fecha}.» (SubscriptionCheckoutForm.tsx:489) si el alta la guardó; si no, el texto de hoy.
// - T-9: «cada {days} días» con el dato de GET /api/subscriptions/planes que guardó el alta (hoy son «7»/«14» escritos, `:81`).
// - No se copian: «Si pagaste con OXXO o transferencia…» (D-9) ni «Hemos enviado un correo de confirmación» (el único correo es el de
//   PAGO, services/email.py:424, cuando MercadoPago cobra: nunca se promete un correo).
// La pestaña y el estado se leen en el navegador dentro de <Suspense>; el HTML del servidor es el de «Procesando...» (como hoy).
import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CORREO_GENERAL } from '@/lib/contacto'
import { formatFechaMexico } from '@/lib/dates'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import { leerSuscripcionPendiente, olvidarSuscripcionPendiente, type SuscripcionPendiente } from './suscripcionPendiente'

type Estado = 'cargando' | 'exito' | 'pendiente' | 'error'

interface Lectura {
  status: string | null
  sinCosto: boolean
}

/** El único que llama `useSearchParams` (patrón R9): le pasa la lectura a la página. */
function Lector({ alLeer }: { alLeer: (l: Lectura) => void }) {
  const parametros = useSearchParams()
  const status = parametros.get('status')
  const sinCosto = parametros.get('sin_costo') === '1'
  useEffect(() => {
    alLeer({ status, sinCosto })
  }, [status, sinCosto, alLeer])
  return null
}

const LARGO: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: undefined }

export default function ConfirmacionSuscripcion() {
  const [estado, setEstado] = useState<Estado>('cargando')
  const [pendiente, setPendiente] = useState<SuscripcionPendiente | null>(null)
  const [sinCosto, setSinCosto] = useState(false)

  const alLeer = useCallback((l: Lectura) => {
    const guardada = leerSuscripcionPendiente()
    setPendiente(guardada)
    setSinCosto(l.sinCosto)
    if (l.sinCosto || l.status === 'authorized' || l.status === 'approved') {
      setEstado('exito')
      olvidarSuscripcionPendiente()
    } else if (l.status === 'pending') {
      setEstado('pendiente')
    } else {
      setEstado('error')
    }
  }, [])

  const frecuencia = pendiente?.frequency === 'weekly' ? 'semanal' : 'quincenal'

  return (
    <main data-testid="sn-suscripcion-confirmacion" data-estado={estado}>
      <Suspense fallback={null}>
        <Lector alLeer={alLeer} />
      </Suspense>
      <Seccion fondo="warm" espacio="grande">
        <Contenedor ancho="angosto" className="text-center">
          {estado === 'cargando' && (
            <div aria-busy="true">
              <Titulo nivel={1} tamano="h2" testId="sn-suscripcion-confirmacion-titulo">
                Procesando...
              </Titulo>
              <Texto className="mt-4">Verificando el estado de tu suscripción</Texto>
            </div>
          )}

          {estado === 'exito' && (
            <div>
              <Titulo nivel={1} tamano="h2" tono="green" testId="sn-suscripcion-confirmacion-titulo">
                ¡Suscripción Activada!
              </Titulo>
              <Texto className="mt-4" testId="sn-suscripcion-confirmacion-plan">
                Tu suscripción a <span className="font-medium">{pendiente?.plan_name || 'Canasta'}</span> con entrega{' '}
                <span className="font-medium">{frecuencia}</span> ha sido activada exitosamente.
              </Texto>
              {sinCosto && pendiente?.mensaje && (
                <Texto className="mt-2" tamano="chico" testId="sn-suscripcion-confirmacion-mensaje">
                  {pendiente.mensaje}
                </Texto>
              )}
              <div className="mx-auto mt-8 max-w-sn-parrafo rounded-sn-tarjeta bg-white p-6 text-left">
                <Titulo nivel={2} tamano="h5">
                  Próximos pasos:
                </Titulo>
                <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0 font-sn-texto text-sn-cuerpo-sm font-light text-sn-ink">
                  <li data-testid="sn-suscripcion-confirmacion-primera" data-fecha={pendiente?.primera_entrega || undefined}>
                    {pendiente?.primera_entrega ? (
                      <>
                        Tu primera canasta llega el{' '}
                        <span className="font-medium">{formatFechaMexico(pendiente.primera_entrega, LARGO)}</span>.
                      </>
                    ) : (
                      'Recibirás tu primera canasta en los próximos días'
                    )}
                  </li>
                  {!sinCosto && typeof pendiente?.dias === 'number' && pendiente.dias > 0 && (
                    <li data-testid="sn-suscripcion-confirmacion-cobros">
                      Los cobros se realizarán automáticamente cada {pendiente.dias} días
                    </li>
                  )}
                  <li>Puedes cancelar desde Mi cuenta › Mis suscripciones en cualquier momento</li>
                </ul>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Boton href="/usuario/suscripciones" flecha testId="sn-suscripcion-confirmacion-mis-suscripciones">
                  Ver mis suscripciones
                </Boton>
                <Boton href="/tienda" variante="contorno" testId="sn-suscripcion-confirmacion-tienda">
                  Seguir comprando
                </Boton>
              </div>
            </div>
          )}

          {estado === 'pendiente' && (
            <div>
              <Titulo nivel={1} tamano="h2" testId="sn-suscripcion-confirmacion-titulo">
                Pago Pendiente
              </Titulo>
              <Texto className="mt-4">Tu suscripción está pendiente de confirmación. Esto puede tomar unos minutos.</Texto>
              <div className="mt-8 flex justify-center">
                <Boton href="/" testId="sn-suscripcion-confirmacion-inicio">
                  Volver al inicio
                </Boton>
              </div>
            </div>
          )}

          {estado === 'error' && (
            <div>
              <Titulo nivel={1} tamano="h2" tono="terra" testId="sn-suscripcion-confirmacion-titulo">
                No se pudo procesar
              </Titulo>
              <Texto className="mt-4">Hubo un problema al procesar tu suscripción. No se realizó ningún cargo.</Texto>
              <Texto className="mt-2" tamano="chico">
                Puedes intentar de nuevo o contactarnos si el problema persiste.
              </Texto>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Boton href="/tienda?pestana=canasta-lista" testId="sn-suscripcion-confirmacion-reintentar">
                  Intentar de nuevo
                </Boton>
                <Boton href={`mailto:${CORREO_GENERAL}`} variante="contorno" testId="sn-suscripcion-confirmacion-soporte">
                  Contactar soporte
                </Boton>
              </div>
            </div>
          )}
        </Contenedor>
      </Seccion>
    </main>
  )
}
