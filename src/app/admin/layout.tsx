import { Metadata } from 'next'
import AdminLayoutClient from './components/AdminLayoutClient'
import { SCRIPT_TEMA_ADMIN } from './tema'
// K2: las reglas del oscuro solo aplican con html[data-tema-admin="oscuro"] y solo en pantalla (la impresión queda clara).
import './tema-oscuro.css'
import './tema-oscuro-especiales.css'
// CLARO1 (R15 F1): lo del claro que no se arregla con clases (placeholders), solo dentro de .panel-admin.
import './tema-claro.css'

export const metadata: Metadata = {
  title: 'Panel Admin - Arcatierra',
  description: 'Panel de administración para empleados y operaciones de Arcatierra',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA_ADMIN }} />
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </>
  )
}
