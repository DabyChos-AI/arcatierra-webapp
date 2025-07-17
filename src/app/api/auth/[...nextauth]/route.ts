/**
 * AUTENTICACIÓN TEMPORALMENTE DESACTIVADA
 * Configuración de NextAuth comentada para evitar errores
 * 16/07/2024
 */

// Funciones dummy para evitar errores de compilación
export async function GET(req: Request) {
  return new Response(JSON.stringify({ status: 'Auth temporarily disabled' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: Request) {
  return new Response(JSON.stringify({ status: 'Auth temporarily disabled' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

