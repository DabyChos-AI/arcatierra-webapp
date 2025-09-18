// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { servicioPago } from '@/lib/mercadopago';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Obtener el ID del pago desde los parámetros
    const idPago = params.id;
    
    if (!idPago) {
      return NextResponse.json(
        { error: 'ID de pago no proporcionado' },
        { status: 400 }
      );
    }

    // Consultar el estado del pago en MercadoPago
    const pago = await servicioPago.get({ id: idPago });
    
    // Mapear estado a español para mejor comprensión
    const estadoEspanol: Record<string, string> = {
      'approved': 'aprobado',
      'pending': 'pendiente',
      'authorized': 'autorizado',
      'in_process': 'en_proceso',
      'in_mediation': 'en_mediacion',
      'rejected': 'rechazado',
      'cancelled': 'cancelado',
      'refunded': 'reembolsado',
      'charged_back': 'contracargo'
    };

    // Mapear detalle del estado
    const detalleEstado: Record<string, string> = {
      'accredited': 'Acreditado',
      'pending_contingency': 'Pendiente de contingencia',
      'pending_review_manual': 'Pendiente de revisión manual',
      'cc_rejected_bad_filled_date': 'Fecha de vencimiento incorrecta',
      'cc_rejected_bad_filled_other': 'Datos incorrectos',
      'cc_rejected_bad_filled_security_code': 'Código de seguridad incorrecto',
      'cc_rejected_blacklist': 'Tarjeta en lista negra',
      'cc_rejected_call_for_authorize': 'Llamar para autorizar',
      'cc_rejected_card_disabled': 'Tarjeta deshabilitada',
      'cc_rejected_duplicated_payment': 'Pago duplicado',
      'cc_rejected_high_risk': 'Alto riesgo',
      'cc_rejected_insufficient_amount': 'Fondos insuficientes',
      'cc_rejected_invalid_installments': 'Cuotas inválidas',
      'cc_rejected_max_attempts': 'Máximo de intentos alcanzado',
      'cc_rejected_other_reason': 'Rechazado por otro motivo'
    };

    // Construir respuesta con validaciones para propiedades opcionales
    const respuesta = {
      exito: true,
      idPago: pago.id,
      estado: estadoEspanol[pago.status] || pago.status,
      estadoOriginal: pago.status,
      detalleEstado: detalleEstado[pago.status_detail] || pago.status_detail,
      monto: pago.transaction_amount,
      montoNeto: pago.net_received_amount || null,
      comisionMP: 0,
      moneda: pago.currency_id,
      idOrden: pago.external_reference,
      metodoPago: {
        tipo: pago.payment_method_id,
        tipoTarjeta: pago.payment_type_id,
        cuotas: pago.installments,
        ultimosDigitos: pago.card?.last_four_digits || null
      },
      pagador: {
        email: pago.payer?.email || null,
        nombre: pago.payer?.first_name || null,
        apellido: pago.payer?.last_name || null,
        identificacion: pago.payer?.identification || null
      },
      fechaCreacion: pago.date_created,
      fechaAprobacion: pago.date_approved || null,
      fechaActualizacion: pago.date_last_updated,
      metadata: pago.metadata || {}
    };

    // Calcular comisión si existe
    if (pago.fee_details && Array.isArray(pago.fee_details) && pago.fee_details.length > 0) {
      respuesta.comisionMP = pago.fee_details.reduce(
        (sum: number, fee: any) => sum + (fee.amount || 0), 
        0
      );
    }

    return NextResponse.json(respuesta);

  } catch (error: any) {
    console.error('Error obteniendo estado del pago:', error);
    
    // Manejar diferentes tipos de errores
    if (error?.status === 404) {
      return NextResponse.json(
        { 
          exito: false,
          error: 'Pago no encontrado',
          mensaje: 'El ID de pago proporcionado no existe en MercadoPago'
        },
        { status: 404 }
      );
    }
    
    if (error?.status === 401) {
      return NextResponse.json(
        { 
          exito: false,
          error: 'Error de autenticación',
          mensaje: 'Token de acceso inválido o expirado'
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        exito: false,
        error: 'Error al consultar el pago',
        mensaje: 'No se pudo obtener el estado del pago. Intenta nuevamente.'
      },
      { status: 500 }
    );
  }
}