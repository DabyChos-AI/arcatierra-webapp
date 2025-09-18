// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { servicioPago } from '@/lib/mercadopago';

// Función principal del webhook
export async function POST(request: NextRequest) {
  try {
    // Obtener headers de MercadoPago (opcional pero recomendado para seguridad)
    const signature = request.headers.get('x-signature') || '';
    const requestId = request.headers.get('x-request-id') || '';
    
    // Obtener el body de la notificación
    const body = await request.json();
    
    console.log('Webhook recibido:', {
      tipo: body.type,
      accion: body.action,
      id: body.data?.id,
      requestId: requestId
    });

    // Procesar diferentes tipos de notificaciones
    switch (body.type) {
      case 'payment':
        await manejarNotificacionPago(body.data.id);
        break;
        
      case 'plan':
        console.log('Notificación de plan recibida:', body.data.id);
        break;
        
      case 'subscription':
        console.log('Notificación de suscripción recibida:', body.data.id);
        break;
        
      case 'invoice':
        console.log('Notificación de factura recibida:', body.data.id);
        break;
        
      default:
        console.log('Tipo de notificación no manejado:', body.type);
    }

    // Siempre responder 200 OK a MercadoPago
    return NextResponse.json({ 
      exito: true,
      mensaje: 'Notificación recibida correctamente'
    });
    
  } catch (error) {
    console.error('Error en webhook de MercadoPago:', error);
    
    // Incluso en error, responder 200 para evitar reintentos de MercadoPago
    return NextResponse.json(
      { 
        exito: false,
        error: 'Error procesando webhook'
      },
      { status: 200 } // Importante: siempre 200
    );
  }
}

// Función para manejar notificaciones de pago
async function manejarNotificacionPago(idPago: string) {
  try {
    // Obtener información completa del pago desde MercadoPago
    const pago = await servicioPago.get({ id: idPago });
    
    console.log('Información del pago:', {
      id: pago.id,
      estado: pago.status,
      monto: pago.transaction_amount,
      ordenId: pago.external_reference,
      email: pago.payer?.email
    });

    // Actualizar según el estado del pago
    switch (pago.status) {
      case 'approved':
        await manejarPagoAprobado(pago);
        break;
        
      case 'pending':
        await manejarPagoPendiente(pago);
        break;
        
      case 'rejected':
        await manejarPagoRechazado(pago);
        break;
        
      case 'cancelled':
        await manejarPagoCancelado(pago);
        break;
        
      case 'refunded':
        await manejarPagoReembolsado(pago);
        break;
        
      default:
        console.log('Estado de pago no manejado:', pago.status);
    }
    
  } catch (error) {
    console.error('Error obteniendo información del pago:', error);
    throw error;
  }
}

// Función para manejar pagos aprobados
async function manejarPagoAprobado(pago: any) {
  const ordenId = pago.external_reference;
  const email = pago.payer?.email;
  const monto = pago.transaction_amount;
  
  console.log(`✅ Pago aprobado - Orden: ${ordenId}, Monto: $${monto}`);
  
  // 1. Actualizar estado de la orden en la base de datos
  await actualizarEstadoOrden(ordenId, 'pagado');
  
  // 2. Enviar email de confirmación al cliente
  if (email) {
    await enviarEmailConfirmacion(email, ordenId, monto);
  }
  
  // 3. Notificar a n8n para procesos adicionales
  await notificarN8N('pago_aprobado', {
    ordenId,
    pagoId: pago.id,
    monto,
    email,
    fecha: new Date().toISOString()
  });
  
  // 4. Si hay metadata adicional, procesarla
  if (pago.metadata) {
    console.log('Metadata del pago:', pago.metadata);
  }
}

// Función para manejar pagos pendientes
async function manejarPagoPendiente(pago: any) {
  const ordenId = pago.external_reference;
  console.log(`⏳ Pago pendiente - Orden: ${ordenId}`);
  
  await actualizarEstadoOrden(ordenId, 'pendiente');
  await notificarN8N('pago_pendiente', { ordenId, pagoId: pago.id });
}

// Función para manejar pagos rechazados
async function manejarPagoRechazado(pago: any) {
  const ordenId = pago.external_reference;
  const razon = pago.status_detail;
  
  console.log(`❌ Pago rechazado - Orden: ${ordenId}, Razón: ${razon}`);
  
  await actualizarEstadoOrden(ordenId, 'rechazado');
  await notificarN8N('pago_rechazado', { 
    ordenId, 
    pagoId: pago.id,
    razon 
  });
}

// Función para manejar pagos cancelados
async function manejarPagoCancelado(pago: any) {
  const ordenId = pago.external_reference;
  console.log(`🚫 Pago cancelado - Orden: ${ordenId}`);
  
  await actualizarEstadoOrden(ordenId, 'cancelado');
  await notificarN8N('pago_cancelado', { ordenId, pagoId: pago.id });
}

// Función para manejar reembolsos
async function manejarPagoReembolsado(pago: any) {
  const ordenId = pago.external_reference;
  const montoReembolsado = pago.transaction_amount;
  
  console.log(`💰 Pago reembolsado - Orden: ${ordenId}, Monto: $${montoReembolsado}`);
  
  await actualizarEstadoOrden(ordenId, 'reembolsado');
  await notificarN8N('pago_reembolsado', { 
    ordenId, 
    pagoId: pago.id,
    monto: montoReembolsado
  });
}

// Funciones auxiliares para comunicación con otros servicios

async function actualizarEstadoOrden(ordenId: string, estado: string) {
  try {
    const respuesta = await fetch('http://n8n:5678/webhook/actualizar-orden', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ordenId,
        estado,
        fechaActualizacion: new Date().toISOString()
      }),
    });
    
    if (!respuesta.ok) {
      console.error('Error actualizando estado de orden');
    }
  } catch (error) {
    console.error('Error conectando con n8n:', error);
  }
}

async function enviarEmailConfirmacion(email: string, ordenId: string, monto: number) {
  try {
    const respuesta = await fetch('http://n8n:5678/webhook/enviar-email-confirmacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        para: email,
        asunto: `Confirmación de pago - Orden ${ordenId}`,
        ordenId,
        monto,
        fecha: new Date().toISOString()
      }),
    });
    
    if (!respuesta.ok) {
      console.error('Error enviando email de confirmación');
    }
  } catch (error) {
    console.error('Error enviando email:', error);
  }
}

async function notificarN8N(evento: string, datos: any) {
  try {
    const respuesta = await fetch(`http://n8n:5678/webhook/mercadopago/${evento}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    
    console.log(`Notificación enviada a n8n: ${evento}`);
  } catch (error) {
    console.error('Error notificando a n8n:', error);
  }
}

// Endpoint adicional GET para verificar que el webhook funciona
export async function GET(request: NextRequest) {
  return NextResponse.json({
    mensaje: 'Webhook de MercadoPago funcionando',
    timestamp: new Date().toISOString(),
    metodo: 'GET'
  });
}