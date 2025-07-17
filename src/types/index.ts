// Tipos principales según el manual técnico

export interface Experiencia {
  id: string;
  nombre: string;
  tipo: 'público' | 'privado';
  descripcion: string;
  duracion: number; // minutos
  precio: {
    adulto: number;
    niño: number;
  };
  capacidad: {
    min: number;
    max: number;
  };
  chinampas: string[];
  horarios: Horario[];
  incluye: string[];
  requisitos: string[];
  imagenes: string[];
  coordenadas: {
    lat: number;
    lng: number;
  };
  slug: string;
  categoria: string;
  disponible: boolean;
}

export interface Slot {
  fecha: Date;
  experienciaId: string;
  disponible: number;
  reservados: number;
  estado: 'disponible' | 'pocosLugares' | 'lleno';
}

export interface Horario {
  dia: DiaSemana;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
}

export type DiaSemana = 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes' | 'sábado' | 'domingo';

export interface Producto {
  id: string;
  sku: string;
  slug: string;
  nombre: string;
  categoria: Categoria;
  subcategoria: string;
  descripcion: string;
  precio: number;
  unidad: 'kg' | 'pieza' | 'manojo';
  stock: number;
  productor: Productor;
  imagenes: string[];
  certificaciones: Certificacion[];
  impactoAmbiental: {
    co2Ahorrado: number;
    aguaAhorrada: number;
    plasticoEvitado: number;
  };
  disponibilidad: {
    [key in DiaSemana]: boolean;
  };
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
}

export interface Productor {
  id: string;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  avatar: string;
  certificaciones: string[];
  experiencia: number; // años
  especialidades: string[];
}

export interface Certificacion {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  organismo: string;
}

export enum RolEmpleado {
  COORDINADOR = 'coordinador',
  GUIA = 'guia',
  CHEF = 'chef',
  AGRICULTOR = 'agricultor',
  APOYO = 'apoyo',
  ADMIN = 'admin'
}

export interface Empleado {
  id: string;
  nombre: string;
  rol: RolEmpleado;
  avatar: string;
  chinampaAsignada?: string;
  metricas: {
    tareasCompletadas: number;
    experienciasGuiadas: number;
    satisfaccionClientes: number;
  };
  horario: Horario[];
  activo: boolean;
}

export interface Reserva {
  id: string;
  experienciaId: string;
  fecha: Date;
  participantes: {
    adultos: number;
    niños: number;
  };
  contacto: {
    nombre: string;
    email: string;
    telefono: string;
  };
  estado: 'pendiente' | 'confirmada' | 'cancelada';
  total: number;
  notas?: string;
  fechaCreacion: Date;
}

export interface Pedido {
  id: string;
  productos: ProductoPedido[];
  total: number;
  estado: 'pendiente' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado';
  cliente: {
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
  };
  fechaEntrega: Date;
  fechaCreacion: Date;
  impactoAmbiental: {
    co2Ahorrado: number;
    aguaAhorrada: number;
    plasticoEvitado: number;
  };
}

export interface ProductoPedido {
  productoId: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  empleadoId: string;
  fecha: Date;
  prioridad: 'baja' | 'media' | 'alta';
  estado: 'pendiente' | 'en_progreso' | 'completada';
  categoria: 'experiencia' | 'mantenimiento' | 'administracion' | 'produccion';
}

export interface Metrica {
  id: string;
  nombre: string;
  valor: number;
  unidad: string;
  fecha: Date;
  tipo: 'ventas' | 'experiencias' | 'produccion' | 'satisfaccion';
}

// Tipos para el calendario
export interface EventoCalendario {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps: {
    experienciaId: string;
    disponibles: number;
    reservados: number;
    precio: number;
    tipo: 'público' | 'privado';
  };
}

// Tipos para el carrito
export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

export interface EstadoCarrito {
  items: ItemCarrito[];
  total: number;
  cantidadItems: number;
  impactoTotal: {
    co2Ahorrado: number;
    aguaAhorrada: number;
    plasticoEvitado: number;
  };
}

// Tipos para filtros
export interface FiltrosExperiencias {
  tipo?: 'público' | 'privado';
  chinampa?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  precioMin?: number;
  precioMax?: number;
  disponibilidad?: 'disponible' | 'pocosLugares' | 'lleno';
}

export interface FiltrosProductos {
  categoria?: string;
  productor?: string;
  precioMin?: number;
  precioMax?: number;
  disponible?: boolean;
  certificacion?: string;
}

