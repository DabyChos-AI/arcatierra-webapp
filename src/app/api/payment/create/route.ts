import { NextRequest, NextResponse } from 'next/server';
import { 
  servicioPreferencia, 
  formatearArticulosParaMP, 
  generarIdOrden,
  guardarOrdenEnBD,
  SolicitudCrearPago 
} from '@/lib/mercadopago';

export async function POST(request: NextRequest) {
  try {
    const body: SolicitudCrearPago = await request.json();
    
    // Validar que hay artículos en el carrito
    if (!body.articulos || body.articulos.length === 0) {
      return NextResponse.json(
        { error: 'No hay productos en el carrito' },
        { status: 400 }
      );
    }

    // Formatear artículos para MercadoPago
    const articulosMP = formatearArticulosParaMP(body.articulos);
    
    // Generar ID único para la orden
    const idOrden = body.idOrden || generarIdOrden();
    
    // Calcular total
    const total = articulosMP.reduce((suma, articulo) => 
      suma + (articulo.unit_price * articulo.quantity), 0
    );

    // Crear preferencia de pago en MercadoPago
    const preferencia = await servicioPreferencia.create({
      body: {
        items: articulosMP,
        payer: {
          email: body.pagador.email,
          name: body.pagador.nombre || '',
          phone: body.pagador.telefono ? {
            area_code: '',
            number: body.pagador.telefono
          } : undefined,
        },
        back_urls: {
          success: `${process.env.MP_SUCCESS_URL}`,
          failure: `${process.env.MP_FAILURE_URL}`,
          pending: `${process.env.MP_PENDING_URL}`,
        },
        auto_return: 'approved',
        notification_url: process.env.MP_WEBHOOK_URL,
        statement_descriptor: 'ARCA TIERRA',
        external_reference: idOrden,
        metadata: {
          orden_id: idOrden,
          usuario_id: body.idUsuario || 'invitado',
          fecha_creacion: new Date().toISOString(),
          total: total,
          cantidad_articulos: articulosMP.length,
        },
        expires: true,
        expiration_date_to: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 horas
      },
    });

    // Guardar orden en base de datos
    await guardarOrdenEnBD({
      id: idOrden,
      preferencia_id: preferencia.id,
      articulos: articulosMP,
      total: total,
      estado: 'pendiente',
      usuario_id: body.idUsuario || null,
      pagador_email: body.pagador.email,
      pagador_nombre: body.pagador.nombre,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    });

    // Responder con la información de la preferencia
    return NextResponse.json({
      exito: true,
      preferenciaId: preferencia.id,
      initPoint: preferencia.init_point,        // URL para producción
      sandboxInitPoint: preferencia.sandbox_init_point, // URL para testing
      ordenId: idOrden,
      total: total,
    });

  } catch (error) {
    console.error('Error creando pago:', error);
    
    // Manejo de errores específicos
    if (error instanceof Error) {
      if (error.message.includes('access_token')) {
        return NextResponse.json(
          { error: 'Error de configuración de MercadoPago' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Error al procesar el pago. Por favor intenta nuevamente.' },
      { status: 500 }
    );
  }
}