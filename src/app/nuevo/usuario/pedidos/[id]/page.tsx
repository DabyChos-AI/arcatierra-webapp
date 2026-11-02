'use client'

import { use } from 'react'
import DetallePedido from '@/components/sitio-nuevo/compras/DetallePedido'
import { decodificarId } from '@/components/sitio-nuevo/compras/compras'

// R15 v2 · F6 (compras): `/usuario/pedidos/<id>` del sitio nuevo (D-F6-03, prefijo de UN segmento; lo entrega cuenta en E2). Como hoy
// (`src/app/usuario/pedidos/[id]/page.tsx:157-159`): página de cliente, `use(params)` y el id decodificado (Next 15 lo entrega codificado).
export default function PaginaDetallePedido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <DetallePedido id={decodificarId(id)} />
}
