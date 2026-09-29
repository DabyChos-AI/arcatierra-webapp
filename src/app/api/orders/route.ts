import { NextResponse } from 'next/server'

// Ruta RETIRADA (C3, 2026-09-29). Ninguna pantalla la usaba: la compra va por
// /api/crear-preferencia-pago. Lo que hacia era crear un "usuario invitado"
// falso, llamar sin sesion a la preferencia de pago (siempre fallaba con 500)
// y, si hubiera funcionado, mandar los datos del cliente a n8n.
// El codigo anterior quedo en route.ts.bak-c3-20260929.
export async function POST() {
  return NextResponse.json(
    { error: 'Esta ruta se retiro. Los pedidos se crean al pagar.' },
    { status: 410 },
  )
}
