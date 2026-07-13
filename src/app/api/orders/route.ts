import { NextRequest, NextResponse } from 'next/server'
// @ts-ignore - NextAuth types issue temporary fix
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

    // Obtener usuario_id de la sesión autenticada o crear usuario invitado
    let usuario_id = null
    if (session?.user?.id) {
      usuario_id = session.user.id
    } else {
      // Crear usuario invitado
      try {
        // Crear usuario invitado directamente en el backend
        const guestUserResponse = await fetch('http://arca-api:8000/api/usuarios/guest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: customerEmail,
            name: orderData.customer.name,
            phone: orderData.customer.phone || ''
          }),
        })

        if (!guestUserResponse.ok) {
          throw new Error('Error creando usuario invitado')
        }

        const guestResult = await guestUserResponse.json()
        usuario_id = guestResult.id
      } catch (error) {
        console.error('Error creando usuario invitado:', error)
        return NextResponse.json(
          { error: 'Error procesando usuario invitado' },
          { status: 500 }
        )
      }
    }

    // Preparar items para Mercado Pago API (solo id y quantity)
    const mercadoPagoItems = orderData.items.map((item: any) => ({
      id: item.id,        // itemcode del producto
      quantity: item.quantity
    }))

    // Crear la preferencia de pago en tu API de Mercado Pago
    const mercadoPagoPayload = {
      items: mercadoPagoItems,
      usuario_id: usuario_id
    }

    // Crear preferencia de pago en Mercado Pago
    const mercadoPagoResponse = await fetch('http://arca-api:8000/api/crear-preferencia-pago', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mercadoPagoPayload),
    })

    if (!mercadoPagoResponse.ok) {
      const errorData = await mercadoPagoResponse.text()
      console.error('Error en Mercado Pago API:', errorData)
      return NextResponse.json(
        { error: 'Error creando preferencia de pago' },
        { status: 500 }
      )
    }

    const mercadoPagoResult = await mercadoPagoResponse.json()

    // Generar ID único para la orden frontend
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Si tienes n8n configurado para otras notificaciones, puedes mantener esta parte
    // @ts-ignore - Process env access
    const n8nUrl = process.env.N8N_WEBHOOK_URL
    if (n8nUrl) {
      const n8nPayload = {
        order_id: orderId,
        mercadopago_preference_id: mercadoPagoResult.id,
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

      try {
        await fetch(n8nUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(n8nPayload),
        })
      } catch (error) {
        console.error('Error enviando a n8n:', error)
        // No fallar la orden por esto
      }
    }

    // Si el guest quiere crear cuenta, generar token y enviar email
    let accountCreationToken = null
    if (orderData.create_account && !session?.user?.email && n8nUrl) {
      accountCreationToken = `ACC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const accountCreationData = {
        type: 'account_creation',
        email: customerEmail,
        name: orderData.customer.name,
        token: accountCreationToken,
        order_id: orderId,
        customer_data: orderData.customer,
        delivery_data: orderData.delivery
      }

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
      }
    }

    // Usar la URL que nos devuelve el backend (ya calcula si es sandbox o producción)
    const paymentUrl = mercadoPagoResult.payment_url || mercadoPagoResult.init_point

    // Responder con éxito
    return NextResponse.json({
      success: true,
      order_id: orderId,
      preference_id: mercadoPagoResult.id,
      payment_url: paymentUrl,
      message: 'Orden creada correctamente',
      account_creation_requested: !!accountCreationToken,
    })

  } catch (error) {
    console.error('Error procesando orden:', error)
    
    // Log detailed error for debugging
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

