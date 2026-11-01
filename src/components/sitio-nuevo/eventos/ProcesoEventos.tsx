// R15 v2 · F4 (eventos): «Cómo trabajamos juntos» (maqueta `.proceso`: 4 pasos numerados). El texto de los pasos no existe para privadas
// (C41 b) y «Respondemos en menos de 24 horas» solo lo dice catering (MAPA-CONTENIDO B §2.4): dos marcas (D-F4-07 P-6) y el encabezado
// solo para lectores de pantalla con una etiqueta neutra (P-3, C24). Lo de privadas de `faq.ts` queda para la FAQ de F5. Componente de servidor.
import Falta from '@/components/sitio-nuevo/Falta'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'

const R = 'sn-eventos-proceso'

export default function ProcesoEventos() {
  return (
    <Seccion testId={R} espacio="normal" etiquetadaPor={`${R}-encabezado`}>
      <Contenedor>
        <h2 id={`${R}-encabezado`} className="sr-only font-sn-titulos font-normal">
          Cómo trabajamos juntos
        </h2>
        <div className="flex flex-col gap-4">
          <Falta que="pasos de cómo trabajamos juntos en un evento privado" quien="Lucio y Pablo" como="bloque" />
          <p className="m-0 font-sn-texto text-sn-cuerpo-sm">
            <Falta que="tiempo de respuesta a una solicitud privada" quien="Encargadas de Experiencias" />
          </p>
        </div>
      </Contenedor>
    </Seccion>
  )
}
