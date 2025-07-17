import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const paymentData = await request.json()
    
    // Validar que el webhook viene de n8n (opcional: verificar signature)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.includes('Bearer')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Extraer datos del pago
    const {
      order_id,
      payment_status,
      payment_id,
      payment_method,
      amount,
      currency,
      customer_email,
      invoice_url,
      timestamp
    } = paymentData

    // Validar datos requeridos
    if (!order_id || !payment_status) {
      return NextResponse.json(
        { error: 'Datos de pago incompletos' },
        { status: 400 }
      )
    }

    console.log(`Webhook recibido - Orden: ${order_id}, Estado: ${payment_status}`)

    // Procesar según el estado del pago
    switch (payment_status) {
      case 'approved':
      case 'paid':
        await handlePaymentApproved({
          order_id,
          payment_id,
          payment_method,
          amount,
          customer_email,
          invoice_url,
        })
        break

      case 'pending':
        await handlePaymentPending({
          order_id,
          payment_id,
          customer_email,
        })
        break

      case 'rejected':
      case 'cancelled':
        await handlePaymentRejected({
          order_id,
          payment_id,
          customer_email,
        })
        break

      default:
        console.warn(`Estado de pago no reconocido: ${payment_status}`)
    }

    // Responder con éxito
    return NextResponse.json({
      success: true,
      message: 'Webhook procesado correctamente',
      order_id,
    })

  } catch (error) {
    console.error('Error procesando webhook de pago:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

async function handlePaymentApproved(data: {
  order_id: string
  payment_id: string
  payment_method: string
  amount: number
  customer_email: string
  invoice_url?: string
}) {
  console.log(`✅ Pago aprobado - Orden: ${data.order_id}`)
  
  // Aquí se actualizaría la base de datos
  // await updateOrderStatus(data.order_id, 'paid')
  
  // Enviar email de confirmación
  // await sendConfirmationEmail(data.customer_email, data.order_id, data.invoice_url)
  
  // Notificar al equipo de fulfillment
  // await notifyFulfillmentTeam(data.order_id)
  
  // Por ahora solo log
  console.log(`Orden ${data.order_id} marcada como pagada`)
}

async function handlePaymentPending(data: {
  order_id: string
  payment_id: string
  customer_email: string
}) {
  console.log(`⏳ Pago pendiente - Orden: ${data.order_id}`)
  
  // Aquí se actualizaría la base de datos
  // await updateOrderStatus(data.order_id, 'pending')
  
  // Enviar email de pago pendiente
  // await sendPendingPaymentEmail(data.customer_email, data.order_id)
  
  console.log(`Orden ${data.order_id} marcada como pendiente`)
}

async function handlePaymentRejected(data: {
  order_id: string
  payment_id: string
  customer_email: string
}) {
  console.log(`❌ Pago rechazado - Orden: ${data.order_id}`)
  
  // Aquí se actualizaría la base de datos
  // await updateOrderStatus(data.order_id, 'cancelled')
  
  // Enviar email de pago rechazado
  // await sendRejectedPaymentEmail(data.customer_email, data.order_id)
  
  console.log(`Orden ${data.order_id} marcada como cancelada`)
}

