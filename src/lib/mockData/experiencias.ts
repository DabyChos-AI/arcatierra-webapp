import { Experiencia, EventoCalendario } from '@/types';

export const experienciasPublicas: Experiencia[] = [
  {
    id: 'exp-pub-001',
    nombre: 'Amanecer Chinampero',
    tipo: 'público',
    descripcion: 'Disfruta del amanecer en las chinampas mientras observas el sol salir desde el horizonte. Una experiencia única que conecta con la naturaleza y la tradición.',
    duracion: 180, // 3 horas
    precio: {
      adulto: 990,
      niño: 790
    },
    capacidad: {
      min: 2,
      max: 15
    },
    chinampas: ['Chinampa del Sol', 'Chinampa Principal'],
    horarios: [
      { dia: 'sábado', horaInicio: '06:00', horaFin: '09:00', activo: true },
      { dia: 'domingo', horaInicio: '06:00', horaFin: '09:00', activo: true }
    ],
    incluye: [
      'Recorrido guiado por las chinampas',
      'Desayuno tradicional mexicano',
      'Bebida caliente (café o té)',
      'Actividad de siembra',
      'Fotografías del amanecer'
    ],
    requisitos: [
      'Llegar 15 minutos antes',
      'Ropa cómoda y abrigadora',
      'Zapatos cerrados antiderrapantes',
      'Cámara fotográfica (opcional)'
    ],
    imagenes: [
      '/images/experiencias/amanecer-chinampero-1.jpg',
      '/images/experiencias/amanecer-chinampero-2.jpg',
      '/images/experiencias/amanecer-chinampero-3.jpg'
    ],
    coordenadas: {
      lat: 19.2647,
      lng: -99.0962
    },
    slug: 'amanecer-chinampero',
    categoria: 'Experiencias Matutinas',
    disponible: true
  },
  {
    id: 'exp-pub-002',
    nombre: 'Brunch en Domingo',
    tipo: 'público',
    descripcion: 'Un brunch especial en las chinampas con ingredientes frescos y locales. Perfecto para disfrutar en familia o con amigos.',
    duracion: 150, // 2.5 horas
    precio: {
      adulto: 990,
      niño: 690
    },
    capacidad: {
      min: 4,
      max: 20
    },
    chinampas: ['Chinampa Gastronómica'],
    horarios: [
      { dia: 'domingo', horaInicio: '10:00', horaFin: '12:30', activo: true }
    ],
    incluye: [
      'Brunch de 3 tiempos',
      'Bebidas naturales',
      'Recorrido por huerto',
      'Actividad de cosecha',
      'Degustación de productos locales'
    ],
    requisitos: [
      'Reservación previa',
      'Ropa cómoda',
      'Mencionar alergias alimentarias'
    ],
    imagenes: [
      '/images/experiencias/brunch-domingo-1.jpg',
      '/images/experiencias/brunch-domingo-2.jpg'
    ],
    coordenadas: {
      lat: 19.2651,
      lng: -99.0958
    },
    slug: 'brunch-domingo',
    categoria: 'Experiencias Gastronómicas',
    disponible: true
  },
  {
    id: 'exp-pub-003',
    nombre: 'Chinampa en Familia',
    tipo: 'público',
    descripcion: 'Experiencia única pensada especialmente para familias donde buscamos que en compañía de las infancias, descubran un vínculo con la agricultura y ecología de una forma divertida.',
    duracion: 300, // 5 horas
    precio: {
      adulto: 990,
      niño: 490
    },
    capacidad: {
      min: 6,
      max: 25
    },
    chinampas: ['Chinampa Familiar'],
    horarios: [
      { dia: 'sábado', horaInicio: '09:00', horaFin: '14:00', activo: true },
      { dia: 'domingo', horaInicio: '09:00', horaFin: '14:00', activo: true }
    ],
    incluye: [
      'Actividades para niños',
      'Taller de siembra',
      'Comida familiar',
      'Juegos tradicionales',
      'Kit de semillas para llevar'
    ],
    requisitos: [
      'Mínimo 2 niños por familia',
      'Ropa que se pueda ensuciar',
      'Protector solar',
      'Gorra o sombrero'
    ],
    imagenes: [
      '/images/experiencias/chinampa-familia-1.jpg',
      '/images/experiencias/chinampa-familia-2.jpg'
    ],
    coordenadas: {
      lat: 19.2649,
      lng: -99.0965
    },
    slug: 'chinampa-familia',
    categoria: 'Experiencias Familiares',
    disponible: true
  },
  {
    id: 'exp-pub-004',
    nombre: 'Amanecer Chinampero con The Curious Mexican',
    tipo: 'público',
    descripcion: 'Disfruta del Amanecer Chinampero curado, operado y organizado con The Curious Mexican. Enamórate de los canales de Xochimilco mientras observas el sol salir desde el horizonte.',
    duracion: 180, // 3 horas
    precio: {
      adulto: 1100,
      niño: 850
    },
    capacidad: {
      min: 4,
      max: 12
    },
    chinampas: ['Chinampa Premium'],
    horarios: [
      { dia: 'sábado', horaInicio: '06:00', horaFin: '09:00', activo: true }
    ],
    incluye: [
      'Guía especializado bilingüe',
      'Desayuno gourmet',
      'Bebidas premium',
      'Fotografía profesional',
      'Transporte desde punto de encuentro'
    ],
    requisitos: [
      'Inglés y español',
      'Confirmación 48 horas antes',
      'Identificación oficial'
    ],
    imagenes: [
      '/images/experiencias/amanecer-curious-1.jpg',
      '/images/experiencias/amanecer-curious-2.jpg'
    ],
    coordenadas: {
      lat: 19.2645,
      lng: -99.0960
    },
    slug: 'amanecer-curious-mexican',
    categoria: 'Experiencias Premium',
    disponible: true
  },
  {
    id: 'exp-pub-005',
    nombre: 'Comidas Chinamperas',
    tipo: 'público',
    descripcion: 'Las comidas chinamperas son una colaboración entre arca tierra y los cocineros y cocineras de México y el mundo que comparten nuestros valores de sustentabilidad, trazabilidad y compromiso con el campo.',
    duracion: 360, // 6 horas
    precio: {
      adulto: 1850,
      niño: 1200
    },
    capacidad: {
      min: 8,
      max: 16
    },
    chinampas: ['Chinampa Gastronómica Premium'],
    horarios: [
      { dia: 'sábado', horaInicio: '12:00', horaFin: '18:00', activo: true }
    ],
    incluye: [
      'Menú de 6 tiempos',
      'Maridaje con bebidas locales',
      'Chef invitado',
      'Recorrido gastronómico',
      'Certificado de participación'
    ],
    requisitos: [
      'Reservación con 1 semana de anticipación',
      'Mencionar restricciones alimentarias',
      'Dress code casual elegante'
    ],
    imagenes: [
      '/images/experiencias/comidas-chinamperas-1.jpg',
      '/images/experiencias/comidas-chinamperas-2.jpg'
    ],
    coordenadas: {
      lat: 19.2648,
      lng: -99.0963
    },
    slug: 'comidas-chinamperas',
    categoria: 'Experiencias Gastronómicas Premium',
    disponible: true
  }
];

export const experienciasPrivadas: Experiencia[] = [
  {
    id: 'exp-priv-001',
    nombre: 'Arcano por un Día',
    tipo: 'privado',
    descripcion: 'Ven a conocer la Chinampa del Sol. Recorre los canales de Xochimilco, conoce cómo funciona la chinampa, quiénes la trabajan y aprende de agroecología y agricultura regenerativa.',
    duracion: 480, // 8 horas
    precio: {
      adulto: 7000,
      niño: 5000
    },
    capacidad: {
      min: 8,
      max: 25
    },
    chinampas: ['Chinampa del Sol'],
    horarios: [
      { dia: 'lunes', horaInicio: '09:00', horaFin: '17:00', activo: true },
      { dia: 'martes', horaInicio: '09:00', horaFin: '17:00', activo: true },
      { dia: 'miércoles', horaInicio: '09:00', horaFin: '17:00', activo: true },
      { dia: 'jueves', horaInicio: '09:00', horaFin: '17:00', activo: true },
      { dia: 'viernes', horaInicio: '09:00', horaFin: '17:00', activo: true }
    ],
    incluye: [
      'Grupo privado',
      'Recorrido guiado',
      'Almuerzo completo',
      'Actividades de agricultura',
      'Transporte interno'
    ],
    requisitos: [
      'Grupo mínimo 8 personas',
      'Reservación con 2 semanas de anticipación',
      'Ropa de trabajo',
      'Protección solar'
    ],
    imagenes: [
      '/images/experiencias/arcano-dia-1.jpg',
      '/images/experiencias/arcano-dia-2.jpg'
    ],
    coordenadas: {
      lat: 19.2647,
      lng: -99.0962
    },
    slug: 'arcano-por-un-dia',
    categoria: 'Experiencias Privadas Educativas',
    disponible: true
  }
  // Más experiencias privadas...
];

// Generar eventos del calendario para las próximas 8 semanas
export const generarEventosCalendario = (): EventoCalendario[] => {
  const eventos: EventoCalendario[] = [];
  const hoy = new Date();
  
  // Generar eventos para las próximas 8 semanas
  for (let semana = 0; semana < 8; semana++) {
    for (let dia = 0; dia < 7; dia++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + (semana * 7) + dia);
      
      // Solo generar eventos para fines de semana para experiencias públicas
      if (fecha.getDay() === 0 || fecha.getDay() === 6) { // Domingo o Sábado
        experienciasPublicas.forEach(exp => {
          const diaNombre = fecha.getDay() === 0 ? 'domingo' : 'sábado';
          const horario = exp.horarios.find(h => h.dia === diaNombre && h.activo);
          
          if (horario) {
            const [horaInicio, minutoInicio] = horario.horaInicio.split(':').map(Number);
            const [horaFin, minutoFin] = horario.horaFin.split(':').map(Number);
            
            const inicio = new Date(fecha);
            inicio.setHours(horaInicio, minutoInicio, 0, 0);
            
            const fin = new Date(fecha);
            fin.setHours(horaFin, minutoFin, 0, 0);
            
            // Simular disponibilidad aleatoria
            const disponibles = Math.floor(Math.random() * exp.capacidad.max) + 1;
            const reservados = exp.capacidad.max - disponibles;
            
            eventos.push({
              id: `${exp.id}-${fecha.toISOString().split('T')[0]}`,
              title: `${exp.nombre} - $${exp.precio.adulto}`,
              start: inicio,
              end: fin,
              backgroundColor: exp.tipo === 'público' ? '#BA6440' : '#33503E',
              borderColor: exp.tipo === 'público' ? '#B15543' : '#475A52',
              textColor: '#FFFFFF',
              extendedProps: {
                experienciaId: exp.id,
                disponibles,
                reservados,
                precio: exp.precio.adulto,
                tipo: exp.tipo
              }
            });
          }
        });
      }
    }
  }
  
  return eventos;
};

