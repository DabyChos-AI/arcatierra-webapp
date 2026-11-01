import { TEXTO_METODO_PAGO_CORTO } from '@/types/tienda'
import { FORMULARIOS_DE_HOY } from './datosFormularios'
import { Apartado, SUBTITULO_LEGAL, TEXTO_LEGAL } from './piezas'

// R15 v2 · F5 (legales): el aviso de privacidad de /privacidad (hoy «Página en construcción...»). D-F5-06; D-F5-11 P-11, P-12, P-14.
// Lo único con fuente (D-F5-06): el proveedor de pagos, MercadoPago (DR68; `TEXTO_METODO_PAGO_CORTO`, `src/types/tienda.ts:14`), y los datos
// que piden los formularios de hoy (`datosFormularios.ts`, cada uno con su archivo:línea). Todo lo demás, una marca a David por apartado de la
// maqueta (L1–L5 de cadena-v2/f5/contacto-F5.md §4). El `h2` repetiría el `h1` de la página: va solo para lectores de pantalla.
export default function AvisoPrivacidad() {
  return (
    <section id="privacidad" data-testid="sn-legal-privacidad" aria-labelledby="sn-legal-privacidad-titulo" className="flex scroll-mt-20 flex-col gap-6">
      <h2 id="sn-legal-privacidad-titulo" data-testid="sn-legal-privacidad-titulo" className="sr-only font-sn-titulos font-normal">
        Política de Privacidad
      </h2>
      <Apartado que="responsable de los datos personales: razón social, domicilio fiscal y RFC" />
      <div className="flex flex-col gap-3">
        <h3 className={SUBTITULO_LEGAL}>Datos que recolectamos</h3>
        <dl data-testid="sn-legal-privacidad-datos" className="m-0 flex flex-col gap-3">
          {FORMULARIOS_DE_HOY.map((f) => (
            <div key={f.clave} data-testid="sn-legal-privacidad-datos-formulario" data-formulario={f.clave}>
              <dt className="m-0 font-sn-texto text-sn-cuerpo-sm font-medium text-sn-ink">{f.titulo}</dt>
              <dd className={TEXTO_LEGAL}>{f.datos.map((x) => x.etiqueta).join(' · ')}</dd>
            </div>
          ))}
        </dl>
        <p data-testid="sn-legal-privacidad-pagos" className={TEXTO_LEGAL}>
          <span className="block">Proveedor de pagos: MercadoPago</span>
          <span className="block">{TEXTO_METODO_PAGO_CORTO}</span>
        </p>
      </div>
      <Apartado que="finalidades del uso de los datos personales" />
      <Apartado que="a quién se transfieren los datos: proveedores de logística y de facturación" />
      <Apartado que="correo para ejercer los derechos ARCO" />
      <Apartado que="cómo se avisan los cambios del aviso y fecha de su última actualización" />
    </section>
  )
}
