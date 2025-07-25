import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    const orderData = await request.json()
    
    // Validar datos requeridos
    const requiredFields = ['items', 'customer', 'delivery', 'totals']
    for (const field of requiredFields) {
      if (!orderData[field]) {
        return NextResponse.json(
          { error: `Campo requerido: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validar que tenemos un email (de sesión o guest)
    const customerEmail = session?.user?.email || orderData.customer?.email
    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Email requerido para procesar la orden' },
        { status: 400 }
      )
    }

    // Generar ID único para la orden
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Preparar datos para n8n
    const n8nPayload = {
      order_id: orderId,
      timestamp: new Date().toISOString(),
      customer: {
        name: orderData.customer.name,
        email: customerEmail,
        phone: orderData.customer.phone,
        rfc: orderData.customer.rfc || null,
        is_guest: !session?.user?.email,
      },
      items: orderData.items.map((item: any) => ({
        product_id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total: item.price * item.quantity,
        category: item.category,
        producer: item.producer,
      })),
      delivery: {
        address: orderData.delivery.address,
        postal_code: orderData.delivery.postal_code,
        city: orderData.delivery.city || 'CDMX',
        preferred_date: orderData.delivery.preferred_date,
        delivery_notes: orderData.delivery.notes || '',
      },
      totals: {
        subtotal: orderData.totals.subtotal,
        shipping: orderData.totals.shipping,
        tax: orderData.totals.tax || 0,
        total: orderData.totals.total,
      },
      payment_method: orderData.payment_method || 'mercado_pago',
      source: 'webapp',
    }

    // Enviar a n8n webhook
    const n8nUrl = process.env.N8N_WEBHOOK_URL
    if (!n8nUrl) {
      return NextResponse.json(
        { error: 'Configuración de webhook no disponible' },
        { status: 500 }
      )
    }

    const n8nResponse = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
    })

    if (!n8nResponse.ok) {
      throw new Error(`Error en n8n: ${n8nResponse.status}`)
    }

    const n8nResult = await n8nResponse.json()

    // Si el guest quiere crear cuenta, generar token y enviar email
    let accountCreationToken = null
    if (orderData.create_account && !session?.user?.email) {
      accountCreationToken = `ACC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Preparar datos para email de creación de cuenta
      const accountCreationData = {
        type: 'account_creation',
        email: customerEmail,
        name: orderData.customer.name,
        token: accountCreationToken,
        order_id: orderId,
        customer_data: orderData.customer,
        delivery_data: orderData.delivery
      }

      // Enviar a n8n para procesamiento de email
      try {
        await fetch(n8nUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(accountCreationData),
        })
      } catch (error) {
        console.error('Error enviando email de creación de cuenta:', error)
        // No fallar la orden por esto
      }
    }

    // Responder con éxito
    return NextResponse.json({
      success: true,
      order_id: orderId,
      payment_url: n8nResult.payment_url,
      message: 'Orden enviada correctamente',
      account_creation_requested: !!accountCreationToken,
    })

  } catch (error) {
    console.error('Error procesando orden:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

