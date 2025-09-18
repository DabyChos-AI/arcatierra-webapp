import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Configurar cliente de MercadoPago
const cliente = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 5000 }
});

export const servicioPreferencia = new Preference(cliente);
export const servicioPago = new Payment(cliente);

// Tipos para la aplicación
export interface ArticuloOrden {
  id: string;
  title: string;           // MercadoPago espera "title"
  description: string;      // MercadoPago espera "description"
  picture_url?: string;     // MercadoPago espera "picture_url"
  quantity: number;         // MercadoPago espera "quantity"
  unit_price: number;       // MercadoPago espera "unit_price"
  currency_id: 'MXN';      // MercadoPago espera "currency_id"
}

export interface SolicitudCrearPago {
  articulos: ArticuloOrden[];
  pagador: {
    email: string;
    nombre?: string;
    telefono?: string;
  };
  idOrden: string;
  idUsuario?: string;
}

// Función para formatear artículos del carrito para MercadoPago
export function formatearArticulosParaMP(articulos: any[]): ArticuloOrden[] {
  return articulos.map(articulo => ({
    id: articulo.id || articulo.itemcode,
    title: articulo.nombre || articulo.title,
    description: articulo.descripcion || '',
    picture_url: articulo.imagen || articulo.image,
    quantity: articulo.cantidad || articulo.quantity || 1,
    unit_price: parseFloat(articulo.precio || articulo.price),
    currency_id: 'MXN'
  }));
}

// Función para generar ID único de orden
export function generarIdOrden(): string {
  const marcaTiempo = Date.now();
  const aleatorio = Math.random().toString(36).substring(2, 9);
  return `ARCA-${marcaTiempo}-${aleatorio}`;
}

// Función para guardar orden en base de datos vía n8n
export async function guardarOrdenEnBD(orden: any) {
  try {
    const respuesta = await fetch('http://n8n:5678/webhook/guardar-orden', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orden),
    });
    return respuesta.json();
  } catch (error) {
    console.error('Error guardando orden:', error);
    throw error;
  }
}