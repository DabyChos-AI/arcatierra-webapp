import { Metadata } from 'next'
import AdminLayoutClient from './components/AdminLayoutClient'

export const metadata: Metadata = {
  title: 'Panel Admin - Arcatierra',
  description: 'Panel de administración para empleados y operaciones de Arcatierra',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
