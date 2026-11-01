// R15 v2 · F5 (recetas, sesión 63): el contacto al pie de la FAQ de hoy (`src/app/experiencias/faq/page.tsx:168-233`; la maqueta lo dice en
// su héroe). Textos de hoy letra por letra (:176-181, :192, :203, :214, :229). Teléfono y correo de `lib/contacto.ts` como hoy (:193,
// :204; D-F5-12 P-15 A). WhatsApp: hoy es un número escrito a mano y falso (:215); aquí la liga de `lib/whatsapp.ts` por
// `CONTACTO.whatsappUrl` con el número visible de la misma fuente (TEL3: el teléfono ES el WhatsApp). Sobre terra solo blanco y warm pasan
// AA en texto chico (CONTRATO-BASE-F1 §2.2).
import { Mail, MessageCircle, Phone } from 'lucide-react'
import { CONTACTO, CORREO_EXPERIENCIAS } from '@/lib/contacto'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import { FOCO_SOBRE_OSCURO, unirClases } from '@/components/sitio-nuevo/ui/clases'

const C = 'sn-faq-contacto'
const LIGA = unirClases('break-words font-sn-texto text-sn-cuerpo text-white underline hover:text-sn-warm', FOCO_SOBRE_OSCURO)
const CANAL = 'flex flex-col items-center gap-2 rounded-sn-tarjeta border border-solid border-sn-warm/30 px-6 py-7 text-center'
const NOMBRE = 'm-0 font-sn-mono text-sn-etiqueta font-medium uppercase text-white'

export default function ContactoFaq() {
  return (
    <Seccion testId={C} fondo="terra" etiquetadaPor={`${C}-h2`}>
      <Contenedor ancho="angosto" className="text-center">
        <Titulo nivel={2} tamano="h2" tono="white" id={`${C}-h2`} testId={`${C}-titulo`}>
          ¿No encontraste lo que buscabas?
        </Titulo>
        <Texto tamano="grande" tono="white" testId={`${C}-texto`} className="mx-auto mt-4 max-w-sn-parrafo">
          Nuestro equipo está aquí para ayudarte con cualquier pregunta adicional
        </Texto>
        <ul className="m-0 mt-10 grid list-none grid-cols-1 gap-6 p-0 min-[861px]:grid-cols-3">
          <li className={CANAL}>
            <Phone aria-hidden="true" className="h-7 w-7 text-white" />
            <h3 className={NOMBRE}>Teléfono</h3>
            <a href={CONTACTO.telefonoHref} data-testid={`${C}-telefono`} className={LIGA}>
              {CONTACTO.telefonoVisible}
            </a>
          </li>
          <li className={CANAL}>
            <Mail aria-hidden="true" className="h-7 w-7 text-white" />
            <h3 className={NOMBRE}>Email</h3>
            <a href={`mailto:${CORREO_EXPERIENCIAS}`} data-testid={`${C}-correo`} className={LIGA}>
              {CORREO_EXPERIENCIAS}
            </a>
          </li>
          <li className={CANAL}>
            <MessageCircle aria-hidden="true" className="h-7 w-7 text-white" />
            <h3 className={NOMBRE}>WhatsApp</h3>
            <a
              href={CONTACTO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`${C}-whatsapp`}
              className={LIGA}
            >
              {CONTACTO.telefonoVisible}
            </a>
          </li>
        </ul>
        <div className="mt-10 flex justify-center">
          <Boton href="/experiencias" sobreOscuro testId={`${C}-experiencias`}>
            Ver Experiencias
          </Boton>
        </div>
      </Contenedor>
    </Seccion>
  )
}
