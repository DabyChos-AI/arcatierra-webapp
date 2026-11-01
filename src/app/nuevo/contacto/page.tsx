import type { Metadata } from 'next'
import CanalesContacto from '@/components/sitio-nuevo/contacto/CanalesContacto'
import EncabezadoContacto from '@/components/sitio-nuevo/contacto/EncabezadoContacto'
import FormularioContacto from '@/components/sitio-nuevo/contacto/FormularioContacto'
import FranjaPersonal from '@/components/sitio-nuevo/contacto/FranjaPersonal'
import VisitaYRedes from '@/components/sitio-nuevo/contacto/VisitaYRedes'
import { METADATA_CONTACTO } from '@/components/sitio-nuevo/contacto/metadatos'

// R15 v2 · F5 (contacto): /contacto del sitio nuevo (maqueta `[data-page="contacto"]`: encabezado, canales y formulario), más lo que hoy trae
// /contacto y la maqueta no (visita, redes y la franja final). Contrato v2 §8-F5 y §9-F5 D-F5-03, D-F5-04, D-F5-06, D-F5-09, D-F5-11;
// cadena-v2/f5/contacto-F5.md. Se ve en /contacto (solo en el link de revisión) cuando la entrega de direcciones de historia agregue la
// dirección (D-F5-03). Página estática: el único dato de afuera es el envío del formulario (POST /api/contacto, desde el navegador).
// La `metadata` es la de /contacto de hoy (`src/app/contacto/layout.tsx`, P-15).
export const metadata: Metadata = METADATA_CONTACTO

export default function ContactoNuevo() {
  return (
    <main data-testid="sn-contacto">
      <EncabezadoContacto />
      <CanalesContacto />
      <FormularioContacto />
      <VisitaYRedes />
      <FranjaPersonal />
    </main>
  )
}
