'use client'

// R15 v2 · F4 (sesión 62): la solicitud de una experiencia PRIVADA desde su ficha del sitio nuevo. Contrato v2 §9-F4 D-F4-07 P-15, D-F4-08,
// D-F4-13; experiencias-F4.md §3.5. Como hoy (src/app/experiencias/[slug]/page.tsx:668-674, :399-405, :715-981): «Solicitar Cotización» abre
// el formulario en una ventana, y `?action=solicitar` lo abre al cargar (lo usa la liga «Solicitar Cotización» de las tarjetas de hoy). El
// formulario es UNO solo, el de eventos (`FormularioSolicitud`), con la experiencia fija: aquí no se copia nada de él (campos, validación,
// cuerpo del POST y canal son suyos). Su base de testids es `sn-detalle-experiencia-solicitud` (D-F4-13), la misma del diálogo. Va con
// `sinPanel` (D-F4-19, E1b de eventos): el diálogo ya trae fondo y relleno, y el formulario no suma los suyos.
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import FormularioSolicitud from '@/components/sitio-nuevo/eventos/FormularioSolicitud'
import type { ExperienciaPrivada } from '@/components/sitio-nuevo/eventos/privadas'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Dialogo from '@/components/sitio-nuevo/ui/Dialogo'

const BASE_SOLICITUD = 'sn-detalle-experiencia-solicitud'

export default function SolicitudPrivada({ experiencia }: { experiencia: ExperienciaPrivada }) {
  const parametros = useSearchParams()
  const [abierta, setAbierta] = useState(false)

  useEffect(() => {
    if (parametros.get('action') === 'solicitar') setAbierta(true)
  }, [parametros])

  const cerrar = () => setAbierta(false)

  return (
    <>
      <Boton forma="recta" anchoCompleto onClick={() => setAbierta(true)} testId="sn-detalle-experiencia-solicitar">
        Solicitar Cotización
      </Boton>
      <Dialogo
        abierto={abierta}
        onCerrar={cerrar}
        titulo="Solicitar Experiencia Privada"
        etiquetaCerrar="Cerrar"
        testId={BASE_SOLICITUD}
      >
        <FormularioSolicitud testId={BASE_SOLICITUD} experiencia={experiencia} sinPanel onEnviada={cerrar} onCancelar={cerrar} />
      </Dialogo>
    </>
  )
}
