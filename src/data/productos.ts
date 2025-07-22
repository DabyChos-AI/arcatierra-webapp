// src/data/productos.ts
export interface Product {
  id: string;
  nombre: string;
  precio: number;
  unidad: string;
  imagen: string;
  productor: string;
  ubicacion: string;
  categoria: string;
  rating: number;
  reviews: number;
  stock: number;
  badges: string[];
  descripcion: string;
  storytelling: string;
  metricas: {
    co2: string;
    agua: string;
    plastico: string;
  };
  // CAMPOS AVANZADOS DE TRAZABILIDAD - FASE 3
  trazabilidad?: {
    agricultor: {
      nombre: string;
      experiencia?: string;
      especializacion?: string;
      fotografia?: string;
    };
    origen: {
      region: string;
      estado: string;
      municipio?: string;
      coordenadas?: {
        lat: number;
        lng: number;
      };
      altitud?: string;
      clima?: string;
    };
    cultivo: {
      metodo: string; // 'Agroecológico', 'Orgánico', 'Biodinámico', etc.
      certificaciones: string[];
      temporada: string;
      tiempoCosecha: string; // 'Esta semana', '< 24 horas', etc.
      tiempoTransporte: string;
    };
    impacto: {
      familiasBeneficiadas?: number;
      kmRecorridos: number;
      empleoLocal: boolean;
      practicasRegenerativas: string[];
    };
  };
  // SEO METADATA POR PRODUCTO
  seo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    categoria_seo: string;
  };
  seoData?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

// Datos de ejemplo (fallback) para la tienda y favoritos en caso de que falle la carga del CSV
export const productos: Product[] = [
  // VERDURAS Y HORTALIZAS FRESCAS
  {
    id: 'espinacas-baby-organicas-200g',
    nombre: 'Espinacas Baby Orgánicas',
    precio: 45.00,
    unidad: '200g',
    imagen: '/products/espinacas-baby-organicas.jpg',
    productor: 'Cirilo Lira Rubiales',
    ubicacion: 'Huasca de Ocampo, Hidalgo',
    categoria: 'verduras',
    rating: 4.9,
    reviews: 124,
    stock: 85,
    badges: ['Orgánico', 'Local', 'Fresco'],
    descripcion: 'Espinacas baby de cultivo orgánico de Huasca de Ocampo, tiernas y nutritivas, perfectas para ensaladas y smoothies verdes.',
    storytelling: 'Cosechadas al amanecer en los campos orgánicos de Huasca de Ocampo por el agricultor Cirilo Lira Rubiales',
    metricas: {
      co2: '0.3 kg CO₂',
      agua: '8L agua',
      plastico: '0g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cirilo Lira Rubiales',
        experiencia: '26 años en agricultura agroecológica',
        especializacion: 'Verduras de hoja verde orgánicas y hierbas aromáticas',
        fotografia: 'https://drive.google.com/file/d/ejemplo-cirilo/view?usp=drive_link'
      },
      origen: {
        region: 'Huasca de Ocampo',
        estado: 'Hidalgo',
        municipio: 'Huasca de Ocampo',
        altitud: '2,400 msnm',
        clima: 'Templado subhúmedo de montaña'
      },
      cultivo: {
        metodo: 'Agroecológico',
        certificaciones: ['SAGARPA Orgánico', 'Comercio Justo', 'Agricultura Familiar'],
        temporada: 'Todo el año con mejor calidad en otoño-invierno',
        tiempoCosecha: 'Esta semana',
        tiempoTransporte: '< 24 horas'
      },
      impacto: {
        familiasBeneficiadas: 1,
        kmRecorridos: 85,
        empleoLocal: true,
        practicasRegenerativas: [
          'Agricultura orgánica certificada',
          'Sin pesticidas sintéticos',
          'Compostaje natural con materia orgánica local',
          'Rotación de cultivos tradicional',
          'Control biológico de plagas',
          'Riego por goteo eficiente'
        ]
      }
    },
    seoData: {
      metaTitle: 'Espinacas Baby Orgánicas 200g | Huasca de Ocampo | Arca Tierra',
      metaDescription: 'Espinacas baby orgánicas cultivadas por Cirilo Lira Rubiales en Huasca de Ocampo. Tiernas, nutritivas y libres de pesticidas.',
      keywords: ['espinacas baby', 'orgánicas', 'Huasca de Ocampo', 'Cirilo Lira', 'verduras frescas', 'sin pesticidas']
    }
  },
  {
    id: 'jitomate-cherry-organico-500g',
    nombre: 'Jitomate Cherry Orgánico',
    precio: 65.00,
    unidad: '500g',
    imagen: '/products/jitomate-cherry-organico.jpg',
    productor: 'Armando Mayoral',
    ubicacion: 'Huasca de Ocampo, Hidalgo',
    categoria: 'verduras',
    rating: 4.7,
    reviews: 89,
    stock: 42,
    badges: ['Orgánico', 'Dulce', 'Local'],
    descripcion: 'Jitomates cherry orgánicos de Huasca de Ocampo, dulces y jugosos, cultivados por Armando Mayoral.',
    storytelling: 'Cultivados con técnicas tradicionales en los valles de Huasca de Ocampo por la familia Mayoral',
    metricas: {
      co2: '1.2 kg CO₂',
      agua: '45L agua',
      plastico: '15g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Armando Mayoral',
        experiencia: '18 años en agricultura familiar',
        especializacion: 'Tomates, chiles y verduras de temporada',
        fotografia: 'https://drive.google.com/file/d/1enRKt4P1mncF9JTRSPh802t9osRYro2k/view?usp=drive_link'
      },
      origen: {
        region: 'Huasca de Ocampo',
        estado: 'Hidalgo',
        municipio: 'Huasca de Ocampo',
        altitud: '2,350 msnm',
        clima: 'Templado subhúmedo de montaña'
      },
      cultivo: {
        metodo: 'Agroecológico',
        certificaciones: ['Agricultura Familiar', 'Comercio Justo'],
        temporada: 'Mayo a Octubre',
        tiempoCosecha: 'Esta semana',
        tiempoTransporte: '< 24 horas'
      },
      impacto: {
        familiasBeneficiadas: 1,
        kmRecorridos: 85,
        empleoLocal: true,
        practicasRegenerativas: ['Sin pesticidas sintéticos', 'Rotación de cultivos', 'Compostaje natural', 'Control biológico de plagas']
      }
    },
    seoData: {
      metaTitle: 'Jitomate Cherry Orgánico 500g | Huasca de Ocampo | Arca Tierra',
      metaDescription: 'Jitomates cherry orgánicos cultivados por Armando Mayoral en Huasca de Ocampo. Dulces, jugosos y cultivados con técnicas familiares tradicionales.',
      keywords: ['jitomate cherry', 'orgánico', 'Huasca de Ocampo', 'Armando Mayoral', 'tomates dulces', 'agricultura familiar']
    }
  },
  {
    id: 'lechuga-romana-hidroponca-250g',
    nombre: 'Lechuga Romana Hidropónica',
    precio: 38.00,
    unidad: '250g',
    imagen: 'https://drive.google.com/file/d/1SaET3Rg51F2ocHBCL7CmyySEtDzljAv9/view?usp=drive_link',
    productor: 'Arca Tierra',
    ubicacion: 'Xochimilco, CDMX',
    categoria: 'verduras',
    rating: 4.6,
    reviews: 76,
    stock: 28,
    badges: ['Hidropónico', 'Fresco', 'Local'],
    descripcion: 'Lechuga romana de Xochimilco, crujiente y nutritiva, cultivada por Arca Tierra con técnicas sustentables.',
    storytelling: 'Cultivada en las chinampas sustentables de Xochimilco por el equipo de Arca Tierra',
    metricas: {
      co2: '0.8 kg CO₂',
      agua: '18L agua',
      plastico: '8g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Equipo Arca Tierra',
        experiencia: '10 años en agricultura sustentable',
        especializacion: 'Lechugas y verduras de hoja en chinampa',
        fotografia: 'https://drive.google.com/file/d/1SaET3Rg51F2ocHBCL7CmyySEtDzljAv9/view?usp=drive_link'
      },
      origen: {
        region: 'Xochimilco',
        estado: 'Ciudad de México',
        municipio: 'Xochimilco',
        altitud: '2,240 msnm',
        clima: 'Chinampa húmeda templada'
      },
      cultivo: {
        metodo: 'Agroecológico en Chinampa',
        certificaciones: ['Agricultura Sustentable', 'Patrimonio Agrícola'],
        temporada: 'Todo el año',
        tiempoCosecha: 'Esta semana',
        tiempoTransporte: '< 24 horas'
      },
      impacto: {
        familiasBeneficiadas: 8,
        kmRecorridos: 25,
        empleoLocal: true,
        practicasRegenerativas: ['Sistema de chinampas', 'Agua de manantial', 'Compostaje orgánico', 'Conservación de biodiversidad']
      }
    },
    seoData: {
      metaTitle: 'Lechuga Romana Sustentable | Xochimilco | Arca Tierra',
      metaDescription: 'Lechuga romana cultivada de forma sustentable en las chinampas de Xochimilco por Arca Tierra. Crujiente, nutritiva y con tradición agrícola.',
      keywords: ['lechuga romana', 'Xochimilco', 'chinampas', 'Arca Tierra', 'sustentable', 'agricultura tradicional']
    }
  },
  {
    id: 'zanahorias-baby-500g',
    nombre: 'Zanahorias Baby',
    precio: 42.00,
    unidad: '500g',
    imagen: 'https://drive.google.com/file/d/1hvghcZTmkD-DUgNyCDPFTBw2gvTNX_6a/view?usp=drive_link',
    productor: 'Armando Mayoral',
    ubicacion: 'Huasca de Ocampo, Hidalgo',
    categoria: 'verduras',
    rating: 4.5,
    reviews: 63,
    stock: 35,
    badges: ['Dulce', 'Fresco', 'Local'],
    descripcion: 'Zanahorias baby tiernas y dulces de Huasca de Ocampo, cultivadas por Armando Mayoral con técnicas tradicionales.',
    storytelling: 'Cultivadas con amor en los valles montañosos de Huasca de Ocampo por la familia Mayoral',
    metricas: {
      co2: '1.5 kg CO₂',
      agua: '28L agua',
      plastico: '12g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Armando Mayoral',
        experiencia: '18 años en agricultura familiar',
        especializacion: 'Hortalizas de raíz y verduras de temporada',
        fotografia: 'https://drive.google.com/file/d/1enRKt4P1mncF9JTRSPh802t9osRYro2k/view?usp=drive_link'
      },
      origen: {
        region: 'Huasca de Ocampo',
        estado: 'Hidalgo',
        municipio: 'Huasca de Ocampo',
        altitud: '2,350 msnm',
        clima: 'Templado subhúmedo de montaña'
      },
      cultivo: {
        metodo: 'Agricultura Familiar Tradicional',
        certificaciones: ['Agricultura Familiar', 'Comercio Justo'],
        temporada: 'Octubre a Marzo',
        tiempoCosecha: 'Esta semana',
        tiempoTransporte: '< 24 horas'
      },
      impacto: {
        familiasBeneficiadas: 1,
        kmRecorridos: 85,
        empleoLocal: true,
        practicasRegenerativas: ['Rotación de cultivos tradicional', 'Compostaje natural', 'Sin pesticidas sintéticos', 'Conservación de semillas criollas']
      }
    },
    seoData: {
      metaTitle: 'Zanahorias Baby 500g | Huasca de Ocampo | Arca Tierra',
      metaDescription: 'Zanahorias baby dulces y tiernas cultivadas por Armando Mayoral en Huasca de Ocampo. Agricultura familiar con 18 años de experiencia.',
      keywords: ['zanahorias baby', 'Huasca de Ocampo', 'Armando Mayoral', 'dulces', 'agricultura familiar', 'Hidalgo']
    }
  },
  {
    id: 'queso-artesanal-sierra-norte-400g',
    nombre: 'Queso Artesanal Sierra Norte',
    precio: 125.00,
    unidad: '400g',
    imagen: '/products/queso-artesanal-sierra-norte.jpg',
    productor: 'Héctor Gómez',
    ubicacion: 'Zacatlán de las Manzanas, Puebla',
    categoria: 'lacteos',
    rating: 4.8,
    reviews: 92,
    stock: 18,
    badges: ['Artesanal', 'Premium', 'Montaña'],
    descripcion: 'Queso artesanal elaborado por Héctor Gómez en Zacatlán de las Manzanas, con técnicas tradicionales de la región.',
    storytelling: 'Tradición quesera familiar en las montañas de Puebla, combinando el aire puro de Zacatlán con recetas ancestrales',
    metricas: {
      co2: '3.2 kg CO₂',
      agua: '85L agua',
      plastico: '35g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Héctor Gómez',
        experiencia: '22 años en producción artesanal',
        especializacion: 'Quesos de montaña y lácteos artesanales',
        fotografia: 'https://drive.google.com/file/d/ejemplo-hector/view?usp=drive_link'
      },
      origen: {
        region: 'Zacatlán de las Manzanas',
        estado: 'Puebla',
        municipio: 'Zacatlán',
        altitud: '2,040 msnm',
        clima: 'Templado húmedo de montaña'
      },
      cultivo: {
        metodo: 'Ganadería Familiar de Montaña',
        certificaciones: ['Producto Artesanal', 'Ganadería Familiar'],
        temporada: 'Todo el año',
        tiempoCosecha: 'Elaborado esta semana',
        tiempoTransporte: '< 36 horas'
      },
      impacto: {
        familiasBeneficiadas: 1,
        kmRecorridos: 145,
        empleoLocal: true,
        practicasRegenerativas: ['Pastoreo en montaña', 'Alimentación natural', 'Técnicas familiares tradicionales', 'Conservación del ecosistema montañoso']
      }
    },
    seoData: {
      metaTitle: 'Queso Artesanal de Montaña 400g | Zacatlán Puebla | Arca Tierra',
      metaDescription: 'Queso artesanal elaborado por Héctor Gómez en Zacatlán de las Manzanas, Puebla. 22 años de experiencia con técnicas familiares tradicionales.',
      keywords: ['queso artesanal', 'Zacatlán', 'Puebla', 'Héctor Gómez', 'montaña', 'técnicas tradicionales']
    }
  },
  {
    id: 'frijol-negro-organico-1kg',
    nombre: 'Frijol Negro Orgánico',
    precio: 85.00,
    unidad: '1kg',
    imagen: 'https://drive.google.com/file/d/1DcN9Gnirr2nCi--BhLdB1VkhruS9-JU5/view?usp=drive_link',
    productor: 'José Rodríguez Jiménez',
    ubicacion: 'Huasca de Ocampo, Hidalgo',
    categoria: 'granos',
    rating: 4.6,
    reviews: 108,
    stock: 25,
    badges: ['Orgánico', 'Proteína', 'Criollo'],
    descripcion: 'Frijol negro orgánico de Huasca de Ocampo, cultivado por José Rodríguez Jiménez con variedades criollas tradicionales.',
    storytelling: 'Cultivado en las tierras altas de Hidalgo con semillas criollas preservadas por generaciones',
    metricas: {
      co2: '2.8 kg CO₂',
      agua: '65L agua',
      plastico: '25g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'José Rodríguez Jiménez',
        experiencia: '20 años en cultivo de leguminosas criollas',
        especializacion: 'Frijoles y maíz nativo de montaña',
        fotografia: 'https://drive.google.com/file/d/ejemplo-jose/view?usp=drive_link'
      },
      origen: {
        region: 'Huasca de Ocampo',
        estado: 'Hidalgo',
        municipio: 'Huasca de Ocampo',
        altitud: '2,400 msnm',
        clima: 'Templado subhúmedo de montaña'
      },
      cultivo: {
        metodo: 'Agricultura Tradicional de Montaña',
        certificaciones: ['Semillas Criollas', 'Agricultura Familiar', 'Libre de Químicos'],
        temporada: 'Julio a Diciembre',
        tiempoCosecha: 'Cosechado el mes pasado',
        tiempoTransporte: '< 24 horas'
      },
      impacto: {
        familiasBeneficiadas: 1,
        kmRecorridos: 85,
        empleoLocal: true,
        practicasRegenerativas: ['Fijación natural de nitrógeno', 'Conservación de semillas criollas', 'Rotación maíz-frijol', 'Abonos orgánicos']
      }
    },
    seoData: {
      metaTitle: 'Frijol Negro Criollo 1kg | Huasca de Ocampo | Arca Tierra',
      metaDescription: 'Frijol negro orgánico cultivado por José Rodríguez Jiménez en Huasca de Ocampo. Variedades criollas con 20 años de experiencia.',
      keywords: ['frijol negro', 'criollo', 'Huasca de Ocampo', 'José Rodríguez', 'semillas nativas', 'Hidalgo']
    }
  },
  {
    id: 'miel-pura-multifloral-500g',
    nombre: 'Miel Pura Multifloral',
    precio: 165.00,
    unidad: '500g',
    imagen: '/products/miel-pura-multifloral.jpg',
    productor: 'Héctor Rutilo',
    ubicacion: 'Valle de Bravo, Estado de México',
    categoria: 'endulzantes',
    rating: 4.9,
    reviews: 156,
    stock: 22,
    badges: ['Pura', '100% Natural', 'Montaña'],
    descripcion: 'Miel pura multifloral de Valle de Bravo, cosechada por Héctor Rutilo en las montañas del Estado de México.',
    storytelling: 'Cosechada en los bosques de Valle de Bravo, donde las abejas se alimentan de flores silvestres de montaña',
    metricas: {
      co2: '2.1 kg CO₂',
      agua: '12L agua',
      plastico: '18g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Héctor Rutilo',
        experiencia: '15 años en apicultura de montaña',
        especializacion: 'Miel de bosque y productos apícolas',
        fotografia: 'https://drive.google.com/file/d/ejemplo-hector-rutilo/view?usp=drive_link'
      },
      origen: {
        region: 'Valle de Bravo',
        estado: 'Estado de México',
        municipio: 'Valle de Bravo',
        altitud: '1,830 msnm',
        clima: 'Templado húmedo de montaña'
      },
      cultivo: {
        metodo: 'Apicultura de Bosque',
        certificaciones: ['Miel Natural', 'Apicultura Sustentable'],
        temporada: 'Marzo a Octubre',
        tiempoCosecha: 'Cosechada este mes',
        tiempoTransporte: '< 36 horas'
      },
      impacto: {
        familiasBeneficiadas: 1,
        kmRecorridos: 125,
        empleoLocal: true,
        practicasRegenerativas: ['Conservación de abejas nativas', 'Protección de flora silvestre', 'Apicultura sin químicos', 'Reforestación melífera']
      }
    },
    seoData: {
      metaTitle: 'Miel Pura de Bosque 500g | Valle de Bravo | Arca Tierra',
      metaDescription: 'Miel pura multifloral cosechada por Héctor Rutilo en Valle de Bravo. 15 años de apicultura de bosque, 100% natural.',
      keywords: ['miel pura', 'Valle de Bravo', 'Héctor Rutilo', 'miel de bosque', 'multifloral', 'Estado de México']
    }
  },
  {
    id: 'miel-pura-250g',
    nombre: 'Miel Pura Multifloral',
    precio: 85.00,
    unidad: '250g',
    imagen: 'https://drive.google.com/file/d/1StOFHn1V1blLhOvQVukXo1pG-3GSMUDG/view?usp=drive_link',
    productor: 'Héctor Rutilo',
    ubicacion: 'Valle de Bravo, Estado de México',
    categoria: 'endulzantes',
    rating: 4.9,
    reviews: 156,
    stock: 22,
    badges: ['Pura', '100% Natural', 'Montaña'],
    descripcion: 'Miel pura multifloral de Valle de Bravo, cosechada por Héctor Rutilo en las montañas del Estado de México.',
    storytelling: 'Cosechada en los bosques de Valle de Bravo, donde las abejas se alimentan de flores silvestres de montaña',
    metricas: {
      co2: '2.1 kg CO₂',
      agua: '12L agua',
      plastico: '18g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Héctor Rutilo',
        experiencia: '15 años en apicultura de montaña',
        especializacion: 'Miel de bosque y productos apícolas',
        fotografia: 'https://drive.google.com/file/d/ejemplo-hector-rutilo/view?usp=drive_link'
      },
      origen: {
        region: 'Valle de Bravo',
        estado: 'Estado de México',
        municipio: 'Valle de Bravo',
        altitud: '1,830 msnm',
        clima: 'Templado húmedo de montaña'
      },
      cultivo: {
        metodo: 'Apicultura de Bosque',
        certificaciones: ['Miel Natural', 'Apicultura Sustentable'],
        temporada: 'Marzo a Octubre',
        tiempoCosecha: 'Cosechada este mes',
        tiempoTransporte: '< 36 horas'
      },
      impacto: {
        familiasBeneficiadas: 1,
        kmRecorridos: 125,
        empleoLocal: true,
        practicasRegenerativas: ['Conservación de abejas nativas', 'Protección de flora silvestre', 'Apicultura sin químicos', 'Reforestación melífera']
      }
    },
    seoData: {
      metaTitle: 'Miel Pura de Bosque 250g | Valle de Bravo | Arca Tierra',
      metaDescription: 'Miel pura multifloral cosechada por Héctor Rutilo en Valle de Bravo. 15 años de apicultura de bosque, 100% natural.',
      keywords: ['miel pura', 'Valle de Bravo', 'Héctor Rutilo', 'miel de bosque', 'multifloral', 'Estado de México']
    }
  },
  {
    id: 'aguacate-hass-organico-500g',
    nombre: 'Aguacate Hass Orgánico',
    precio: 80.00,
    unidad: '500g',
    imagen: '/products/aguacate-hass-organico.jpg',
    productor: 'Héctor Gómez',
    ubicacion: 'Zacatlán de las Manzanas, Puebla',
    categoria: 'frutas',
    rating: 4.8,
    reviews: 203,
    stock: 30,
    badges: ['Orgánico', 'Criollo', 'Montaña'],
    descripcion: 'Aguacate Hass orgánico de Zacatlán, cultivado por Héctor Gómez en las montañas de Puebla.',
    storytelling: 'Del corazón de las montañas poblanas, donde el clima templado crea aguacates de sabor excepcional',
    metricas: {
      co2: '3.2 kg CO₂',
      agua: '40L agua',
      plastico: '55g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Héctor Gómez',
        experiencia: '22 años en fruticultura de montaña',
        especializacion: 'Aguacates criollos y frutas de clima templado',
        fotografia: 'https://drive.google.com/file/d/ejemplo-hector-aguacate/view?usp=drive_link'
      },
      origen: {
        region: 'Zacatlán de las Manzanas',
        estado: 'Puebla',
        municipio: 'Zacatlán',
        altitud: '2,040 msnm',
        clima: 'Templado húmedo de montaña'
      },
      cultivo: {
        metodo: 'Fruticultura Familiar de Montaña',
        certificaciones: ['Agricultura Familiar', 'Libre de Químicos'],
        temporada: 'Mayo a Noviembre',
        tiempoCosecha: 'Cosechado esta semana',
        tiempoTransporte: '< 36 horas'
      },
      impacto: {
        familiasBeneficiadas: 1,
        kmRecorridos: 145,
        empleoLocal: true,
        practicasRegenerativas: ['Agroforestería de montaña', 'Conservación de variedades criollas', 'Manejo orgánico', 'Protección del bosque']
      }
    },
    seoData: {
      metaTitle: 'Aguacate Hass Criollo 500g | Zacatlán Puebla | Arca Tierra',
      metaDescription: 'Aguacate Hass orgánico cultivado por Héctor Gómez en Zacatlán de las Manzanas. 22 años de fruticultura de montaña.',
      keywords: ['aguacate Hass', 'Zacatlán', 'Héctor Gómez', 'aguacate criollo', 'Puebla', 'montaña']
    }
  },
  {
    id: 'chile-serrano-fresco-100g',
    nombre: 'Chile Serrano Fresco',
    precio: 25.00,
    unidad: '100g',
    imagen: '/products/chile-serrano-fresco.jpg',
    productor: 'Ricardo González',
    ubicacion: 'Pahuatlán, Puebla',
    categoria: 'verduras',
    rating: 4.6,
    reviews: 89,
    stock: 25,
    badges: ['Picante', 'Fresco', 'Regional'],
    descripcion: 'Chile serrano fresco de Pahuatlán, cultivado por Ricardo González con variedades tradicionales de la Sierra Norte de Puebla.',
    storytelling: 'Del corazón de la Sierra Norte de Puebla, donde los chiles crecen con el sabor auténtico de la tradición',
    metricas: {
      co2: '1.2 kg CO₂',
      agua: '15L agua',
      plastico: '30g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Ricardo González',
        experiencia: '25 años en chiles tradicionales de la sierra',
        especializacion: 'Chiles serranos, manzanos y variedades regionales',
        fotografia: 'https://drive.google.com/file/d/ejemplo-ricardo/view?usp=drive_link'
      },
      origen: {
        region: 'Pahuatlán',
        estado: 'Puebla',
        municipio: 'Pahuatlán',
        altitud: '1,680 msnm',
        clima: 'Templado húmedo de montaña'
      },
      cultivo: {
        metodo: 'Agricultura Tradicional de Sierra',
        certificaciones: ['Variedades Regionales', 'Agricultura Familiar'],
        temporada: 'Junio - Noviembre',
        tiempoCosecha: 'Cosechado hace 2 días',
        tiempoTransporte: '< 48 horas'
      },
      impacto: {
        familiasBeneficiadas: 1,
        kmRecorridos: 180,
        empleoLocal: true,
        practicasRegenerativas: ['Conservación de variedades criollas', 'Rotación tradicional', 'Control biológico natural', 'Agricultura de montaña sostenible']
      }
    },
    seoData: {
      metaTitle: 'Chile Serrano Fresco 100g | Pahuatlán Puebla | Arca Tierra',
      metaDescription: 'Chile serrano fresco cultivado por Ricardo González en Pahuatlán, Puebla. 25 años de experiencia, variedades regionales tradicionales.',
      keywords: ['chile serrano', 'Pahuatlán', 'Ricardo González', 'chile fresco', 'Puebla', 'variedades regionales']
    }
  },
  {
    id: 'cilantro-fresco-organico-manojo',
    nombre: 'Cilantro Fresco Orgánico',
    precio: 15.00,
    unidad: 'manojo',
    imagen: '/products/cilantro-fresco-organico.jpg',
    productor: 'Carmen Morales',
    ubicacion: 'Valle de Bravo, Estado de México',
    categoria: 'hierbas',
    rating: 4.5,
    reviews: 72,
    stock: 40,
    badges: ['Orgánico', 'Fresco', 'Local'],
    descripcion: 'Cilantro fresco orgánico cultivado por Carmen Morales en Valle de Bravo, aromático y lleno de sabor para tus platillos.',
    storytelling: 'Desde las alturas del Valle de Bravo, donde el cilantro crece con el aroma puro de la montaña',
    metricas: {
      co2: '0.8 kg CO₂',
      agua: '12L agua',
      plastico: '8g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Carmen Morales',
        experiencia: '18 años en hierbas aromáticas orgánicas',
        especializacion: 'Cilantro, perejil y hierbas culinarias de montaña',
        fotografia: 'https://drive.google.com/file/d/ejemplo-carmen/view?usp=drive_link'
      },
      origen: {
        region: 'Valle de Bravo',
        estado: 'Estado de México',
        municipio: 'Valle de Bravo',
        altitud: '1,830 msnm',
        clima: 'Templado húmedo de montaña'
      },
      cultivo: {
        metodo: 'Agricultura Orgánica Familiar',
        certificaciones: ['Orgánico Certificado', 'Agricultura Familiar', 'Libre de Químicos'],
        temporada: 'Todo el año',
        tiempoCosecha: 'Cosechado hace 12 horas',
        tiempoTransporte: '< 18 horas'
      },
      impacto: {
        familiasBeneficiadas: 1,
        kmRecorridos: 110,
        empleoLocal: true,
        practicasRegenerativas: ['Rotación de cultivos', 'Composta casera', 'Control biológico natural', 'Semillas orgánicas', 'Conservación de agua de montaña']
      }
    },
    seoData: {
      metaTitle: 'Cilantro Fresco Orgánico Manojo | Valle de Bravo | Arca Tierra',
      metaDescription: 'Cilantro fresco orgánico cultivado por Carmen Morales en Valle de Bravo. 18 años de experiencia, cosechado hace 12 horas.',
      keywords: ['cilantro orgánico', 'Valle de Bravo', 'Carmen Morales', 'cilantro fresco', 'hierbas orgánicas', 'Estado de México']
    }
  },
  {
    id: 'leche-cabra-pasteurizada-1l',
    nombre: 'Leche de Cabra Pasteurizada',
    precio: 95.00,
    unidad: '1L',
    imagen: 'https://drive.google.com/file/d/1XwJ2z8pQ9vLmN4sR7tK6yU3eI5oA8cBd/view?usp=drive_link',
    productor: 'Roberto Sandoval',
    ubicacion: 'Ezequiel Montes, Querétaro',
    categoria: 'lacteos',
    rating: 4.7,
    reviews: 54,
    stock: 18,
    badges: ['Premium', 'Pasteurizada', 'Sostenible'],
    descripcion: 'Leche de cabra pasteurizada de Roberto Sandoval en Querétaro, rica en nutrientes y fácil digestión.',
    storytelling: 'De cabras felices en los pastizales del semiárido queretano, donde la tradición lechera se une con la sostenibilidad',
    metricas: {
      co2: '4.8 kg CO₂',
      agua: '65L agua',
      plastico: '45g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Roberto Sandoval',
        experiencia: '25 años en caprinocultura sostenible',
        especializacion: 'Leche de cabra y quesos artesanales de pastoreo',
        fotografia: 'https://drive.google.com/file/d/ejemplo-roberto/view?usp=drive_link'
      },
      origen: {
        region: 'Ezequiel Montes',
        estado: 'Querétaro',
        municipio: 'Ezequiel Montes',
        altitud: '2,000 msnm',
        clima: 'Semiárido templado'
      },
      cultivo: {
        metodo: 'Caprinocultura Extensiva Sostenible',
        certificaciones: ['SENASICA', 'Bienestar Animal', 'Pastoreo Rotativo'],
        temporada: 'Todo el año',
        tiempoCosecha: 'Ordeñada esta mañana',
        tiempoTransporte: '< 36 horas'
      },
      impacto: {
        familiasBeneficiadas: 1,
        kmRecorridos: 245,
        empleoLocal: true,
        practicasRegenerativas: ['Pastoreo rotativo', 'Regeneración de pastizales', 'Conservación de razas criollas', 'Caprinocultura familiar', 'Manejo holístico']
      }
    },
    seoData: {
      metaTitle: 'Leche Cabra Pasteurizada 1L | Ezequiel Montes Querétaro | Arca Tierra',
      metaDescription: 'Leche cabra pasteurizada por Roberto Sandoval en Ezequiel Montes, Querétaro. 25 años de caprinocultura sostenible, ordeñada esta mañana.',
      keywords: ['leche cabra', 'Ezequiel Montes', 'Roberto Sandoval', 'leche pasteurizada', 'Querétaro', 'caprinocultura sostenible']
    }
  },
  {
    id: 'manzanas-rojas-organicas-kg',
    nombre: 'Manzanas Rojas Orgánicas',
    precio: 65.00,
    unidad: 'kg',
    imagen: '/products/manzanas-rojas-organicas.jpg',
    productor: 'Fernando Ruiz',
    ubicacion: 'Cuauhtémoc, Chihuahua',
    categoria: 'frutas',
    rating: 4.7,
    reviews: 93,
    stock: 35,
    badges: ['Orgánico Certificado', 'Sin Ceras', 'Altura'],
    descripcion: 'Manzanas rojas orgánicas de la Sierra de Chihuahua, cultivadas por Fernando Ruiz con 32 años de experiencia en fruticultura de altura.',
    storytelling: 'Desde los huertos orgánicos de altura en la Sierra de Chihuahua, donde el agua de montaña y el clima templado crean manzanas de sabor excepcional',
    metricas: {
      co2: '2.1 kg CO₂',
      agua: '35L agua',
      plastico: '40g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Fernando Ruiz Castellanos',
        experiencia: '32 años en fruticultura orgánica de sierra',
        especializacion: 'Manzanas, peras y frutas de clima templado de altura',
        fotografia: 'https://drive.google.com/file/d/ejemplo-fernando/view?usp=drive_link'
      },
      origen: {
        region: 'Sierra de Chihuahua',
        estado: 'Chihuahua',
        municipio: 'Cuauhtémoc',
        altitud: '2,050 msnm',
        clima: 'Templado seco de montaña'
      },
      cultivo: {
        metodo: 'Huerto Orgánico de Altura',
        certificaciones: ['Orgánico CERTIMEX', 'Sin Ceras', 'Libre de Pesticidas'],
        temporada: 'Agosto - Noviembre',
        tiempoCosecha: 'Cosechadas hace 1 semana',
        tiempoTransporte: '< 5 días'
      },
      impacto: {
        familiasBeneficiadas: 1,
        kmRecorridos: 1425,
        empleoLocal: true,
        practicasRegenerativas: ['Huerto orgánico de altura', 'Agua de montaña pura', 'Control biológico natural', 'Conservación de variedades tradicionales', 'Injertos ancestrales']
      }
    },
    seoData: {
      metaTitle: 'Manzanas Rojas Orgánicas kg | Sierra Chihuahua | Arca Tierra',
      metaDescription: 'Manzanas rojas orgánicas cultivadas por Fernando Ruiz en Sierra de Chihuahua. 32 años de experiencia, huerto orgánico de altura, sin ceras.',
      keywords: ['manzanas rojas orgánicas', 'Sierra Chihuahua', 'Fernando Ruiz', 'manzanas sin ceras', 'frutas orgánicas', 'huerto altura']
    }
  },
  {
    id: 'miel-abeja-pura-frasco',
    nombre: 'Miel Pura de Abeja',
    precio: 160.00,
    unidad: 'frasco 500g',
    imagen: '/products/miel-pura-de-abeja.jpg',
    productor: 'Pascual González',
    ubicacion: 'Cuernavaca, Morelos',
    categoria: 'endulzantes',
    rating: 5.0,
    reviews: 121,
    stock: 22,
    badges: ['100% Natural', 'Sin Filtrar', 'Cruda'],
    descripcion: 'Miel pura de abeja sin procesar de Cuernavaca, producida por Pascual González con 38 años de apicultura tradicional.',
    storytelling: 'Del Valle de Cuernavaca, donde las abejas libres de pesticidas crean miel con todas sus propiedades medicinales',
    metricas: {
      co2: '1.7 kg CO₂',
      agua: '12L agua',
      plastico: '55g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Pascual González Herrera',
        experiencia: '38 años en apicultura tradicional sin químicos',
        especializacion: 'Miel cruda sin filtrar y propiedades medicinales',
        fotografia: 'https://drive.google.com/file/d/ejemplo-pascual/view?usp=drive_link'
      },
      origen: {
        region: 'Valle de Cuernavaca',
        estado: 'Morelos',
        municipio: 'Cuernavaca',
        altitud: '1,510 msnm',
        clima: 'Cálido subhúmedo con flores todo el año'
      },
      cultivo: {
        metodo: 'Apicultura Natural Tradicional',
        certificaciones: ['Sin Antibioticos', 'Sin Pesticidas', 'Miel Cruda'],
        temporada: 'Marzo - Noviembre',
        tiempoCosecha: 'Cosechada hace 1 semana',
        tiempoTransporte: '< 48 horas'
      },
      impacto: {
        familiasBeneficiadas: 1,
        kmRecorridos: 95,
        empleoLocal: true,
        practicasRegenerativas: ['Polinización natural', 'Conservación de abejas nativas', 'Flora diversa', 'Manejo natural de colmenas', 'Regeneración de ecosistemas']
      }
    },
    seoData: {
      metaTitle: 'Miel Pura Abeja 500g | Cuernavaca Morelos | Arca Tierra',
      metaDescription: 'Miel pura abeja sin filtrar de Pascual González en Cuernavaca, Morelos. 38 años de apicultura tradicional, cosechada hace 1 semana.',
      keywords: ['miel pura', 'Cuernavaca', 'Pascual González', 'miel sin filtrar', 'Morelos', 'apicultura natural']
    }
  },
  // ===========================================
  // EXPANSIÓN MASIVA DEL CATÁLOGO - FASE 1
  // Importando productos desde tiendaSEO.csv
  // ===========================================
  
  // CANASTAS DE TEMPORADA
  {
    id: 'canasta-individual-suscripcion',
    nombre: 'Canasta Individual Suscripción',
    precio: 290.00,
    unidad: 'canasta',
    imagen: '/products/canasta-individual-suscripcion.jpg',
    productor: 'Red Arca Tierra',
    ubicacion: 'Múltiples regiones, México',
    categoria: 'canastas',
    rating: 4.9,
    reviews: 145,
    stock: 50,
    badges: ['Suscripción', '5% Descuento', 'Multirregional'],
    descripcion: 'Canasta individual de 3.5 kg con selección de verduras de temporada de múltiples productores aliados de la Red Arca Tierra.',
    storytelling: 'Canasta curada que conecta múltiples comunidades campesinas, llevando la biodiversidad directamente a tu mesa',
    metricas: {
      co2: '4.2 kg CO₂ ahorrado',
      agua: '85L agua',
      plastico: '150g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Red Arca Tierra - Coordinadora: María Elena Vázquez',
        experiencia: '8 años coordinando red de productores sustentables',
        especializacion: 'Coordinación de cadenas cortas y agricultura regenerativa',
        fotografia: 'https://drive.google.com/file/d/ejemplo-maria-elena/view?usp=drive_link'
      },
      origen: {
        region: 'Múltiples regiones',
        estado: 'México, Puebla, Estado de México, Morelos',
        municipio: 'Red de comunidades',
        altitud: 'Variable 800-2500 msnm',
        clima: 'Diversidad de microclimas'
      },
      cultivo: {
        metodo: 'Red de Agricultura Regenerativa',
        certificaciones: ['Red Certificada', 'Comercio Justo', 'Agricultura Familiar'],
        temporada: 'Rotación estacional',
        tiempoCosecha: 'Cosechado según temporada',
        tiempoTransporte: '< 48 horas desde origen más lejano'
      },
      impacto: {
        familiasBeneficiadas: 25,
        kmRecorridos: 180,
        empleoLocal: true,
        practicasRegenerativas: ['Diversidad de cultivos', 'Conservación de semillas criollas', 'Rotación de productores', 'Fortalecimiento de redes campesinas', 'Cadenas cortas de abastecimiento']
      }
    },
    seoData: {
      metaTitle: 'Canasta Individual Suscripción 3.5kg | Red Arca Tierra | Arca Tierra',
      metaDescription: 'Canasta individual suscripción con verduras de temporada de 25+ productores de la Red Arca Tierra. 5% descuento, agricultura regenerativa.',
      keywords: ['canasta individual suscripción', 'Red Arca Tierra', 'verduras temporada', 'agricultura regenerativa', 'comercio justo']
    }
  },
  {
    id: 'canasta-individual-unica',
    nombre: 'Canasta Individual Compra Única',
    precio: 305.00,
    unidad: 'canasta',
    imagen: '/products/canasta-individual-unica.jpg',
    productor: 'Red Arca Tierra',
    ubicacion: 'Múltiples regiones, México',
    categoria: 'canastas',
    rating: 4.8,
    reviews: 89,
    stock: 30,
    badges: ['Compra Única', 'Variedad Semanal', 'Sin Compromiso'],
    descripcion: 'Canasta individual de 3.5 kg con verduras frescas de temporada de la Red Arca Tierra, ideal para 1-2 personas.',
    storytelling: 'Flexibilidad total para descubrir la biodiversidad campesina sin compromiso de suscripción',
    metricas: {
      co2: '4.2 kg CO₂ ahorrado',
      agua: '85L agua',
      plastico: '150g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Red Arca Tierra - Coordinadora: María Elena Vázquez',
        experiencia: '8 años coordinando red de productores sustentables',
        especializacion: 'Coordinación de cadenas cortas y diversidad alimentaria',
        fotografia: 'https://drive.google.com/file/d/ejemplo-maria-elena/view?usp=drive_link'
      },
      origen: {
        region: 'Múltiples regiones',
        estado: 'México, Puebla, Estado de México, Morelos',
        municipio: 'Red de comunidades campesinas',
        altitud: 'Variable 800-2500 msnm',
        clima: 'Diversidad de microclimas mexicanos'
      },
      cultivo: {
        metodo: 'Red de Agricultura Familiar Regenerativa',
        certificaciones: ['Red Certificada', 'Agricultura Familiar', 'Comercio Directo'],
        temporada: 'Selección semanal según disponibilidad',
        tiempoCosecha: 'Cosechado en días previos',
        tiempoTransporte: '< 48 horas desde origen más lejano'
      },
      impacto: {
        familiasBeneficiadas: 25,
        kmRecorridos: 180,
        empleoLocal: true,
        practicasRegenerativas: ['Diversidad alimentaria', 'Conservación de variedades locales', 'Apoyo a pequeños productores', 'Reducción de intermediarios', 'Fortalecimiento de economías locales']
      }
    },
    seoData: {
      metaTitle: 'Canasta Individual Compra Única 3.5kg | Red Arca Tierra | Arca Tierra',
      metaDescription: 'Canasta individual compra única con verduras frescas de temporada de la Red Arca Tierra. Sin compromiso, ideal para 1-2 personas.',
      keywords: ['canasta individual', 'compra única', 'Red Arca Tierra', 'verduras frescas', 'sin compromiso', 'agricultura familiar']
    }
  },
  {
    id: 'canasta-media-suscripcion',
    nombre: 'Canasta Media Suscripción',
    precio: 350.00,
    unidad: 'canasta',
    imagen: '/products/canasta-media-suscripcion.jpg',
    productor: 'Red Arca Tierra',
    ubicacion: 'Múltiples regiones, México',
    categoria: 'canastas',
    rating: 4.9,
    reviews: 203,
    stock: 40,
    badges: ['Suscripción', 'Ideal 2-3 Personas', '5kg'],
    descripcion: 'Canasta media de 5 kg con selección amplia de verduras de temporada de la Red Arca Tierra, ideal para 2-3 personas.',
    storytelling: 'El tamaño perfecto para hogares pequeños que buscan variedad y frescura de múltiples comunidades',
    metricas: {
      co2: '6.8 kg CO₂ ahorrado',
      agua: '125L agua',
      plastico: '200g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Red Arca Tierra - Coordinadora: María Elena Vázquez',
        experiencia: '8 años coordinando red de productores sustentables',
        especializacion: 'Coordinación de cadenas cortas y diversidad culinaria',
        fotografia: 'https://drive.google.com/file/d/ejemplo-maria-elena/view?usp=drive_link'
      },
      origen: {
        region: 'Múltiples regiones',
        estado: 'México, Puebla, Estado de México, Morelos, Tlaxcala',
        municipio: 'Red ampliada de comunidades',
        altitud: 'Variable 800-2500 msnm',
        clima: 'Diversidad de microclimas y temporadas'
      },
      cultivo: {
        metodo: 'Red de Agricultura Regenerativa Ampliada',
        certificaciones: ['Red Certificada', 'Comercio Justo', 'Agricultura Familiar', 'Diversidad Garantizada'],
        temporada: 'Rotación estacional con mayor variedad',
        tiempoCosecha: 'Cosechado según temporada de cada región',
        tiempoTransporte: '< 48 horas desde origen más lejano'
      },
      impacto: {
        familiasBeneficiadas: 35,
        kmRecorridos: 200,
        empleoLocal: true,
        practicasRegenerativas: ['Mayor diversidad de cultivos', 'Conservación de semillas regionales', 'Rotación entre más productores', 'Fortalecimiento de redes rurales', 'Cadenas cortas especializadas']
      }
    },
    seoData: {
      metaTitle: 'Canasta Media Suscripción 5kg | Red Arca Tierra | Arca Tierra',
      metaDescription: 'Canasta media suscripción con 5kg de verduras de temporada de 35+ productores de la Red Arca Tierra. Ideal para 2-3 personas.',
      keywords: ['canasta media suscripción', 'Red Arca Tierra', '5kg verduras', '2-3 personas', 'agricultura regenerativa', 'diversidad']
    }
  },
  {
    id: 'canasta-completa-suscripcion',
    nombre: 'Canasta Completa Suscripción',
    precio: 510.00,
    unidad: 'canasta',
    imagen: '/products/canasta-completa-suscripcion.jpg',
    productor: 'Red Arca Tierra',
    ubicacion: 'Múltiples regiones, México',
    categoria: 'canastas',
    rating: 5.0,
    reviews: 178,
    stock: 35,
    badges: ['Suscripción', 'Variedad Máxima', '7.5kg'],
    descripcion: 'Canasta completa de 7.5 kg con la mayor variedad: hojas verdes, raíces, hortalizas y verduras de temporada de toda la Red Arca Tierra.',
    storytelling: 'La experiencia completa de la red campesina: máxima diversidad, máxima frescura, máximo impacto social',
    metricas: {
      co2: '9.5 kg CO₂ ahorrado',
      agua: '185L agua',
      plastico: '320g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Red Arca Tierra - Coordinadora: María Elena Vázquez',
        experiencia: '8 años coordinando la red campesina más diversa',
        especializacion: 'Coordinación de máxima diversidad y calidad premium',
        fotografia: 'https://drive.google.com/file/d/ejemplo-maria-elena/view?usp=drive_link'
      },
      origen: {
        region: 'Red completa nacional',
        estado: 'México, Puebla, Estado de México, Morelos, Tlaxcala, Hidalgo',
        municipio: 'Red completa de comunidades especializadas',
        altitud: 'Variable 800-2800 msnm',
        clima: 'Todos los microclimas de la red'
      },
      cultivo: {
        metodo: 'Red de Agricultura Regenerativa Premium',
        certificaciones: ['Red Certificada Premium', 'Comercio Justo', 'Agricultura Familiar', 'Máxima Diversidad'],
        temporada: 'Rotación completa con productores especializados',
        tiempoCosecha: 'Cosechado según especialidad de cada productor',
        tiempoTransporte: '< 48 horas desde el origen más lejano'
      },
      impacto: {
        familiasBeneficiadas: 50,
        kmRecorridos: 220,
        empleoLocal: true,
        practicasRegenerativas: ['Máxima diversidad de cultivos', 'Conservación completa de semillas', 'Apoyo integral a productores', 'Fortalecimiento de toda la red', 'Cadenas cortas especializadas']
      }
    },
    seoData: {
      metaTitle: 'Canasta Completa Suscripción 7.5kg | Red Arca Tierra | Arca Tierra',
      metaDescription: 'Canasta completa suscripción con 7.5kg de máxima variedad de toda la Red Arca Tierra. 50+ productores, experiencia completa campesina.',
      keywords: ['canasta completa suscripción', 'Red Arca Tierra', '7.5kg variedad', 'máxima diversidad', 'agricultura regenerativa premium']
    }
  },
  
  // ACEITES NATURALES
  {
    id: 'aceite-ajonjoli-refinado-500ml',
    nombre: 'Aceite de Ajonjolí Refinado',
    precio: 165.00,
    unidad: '500ml',
    imagen: '/products/aceite-ajonjoli-refinado.jpg',
    productor: 'Antonio Flores',
    ubicacion: 'Celaya, Guanajuato',
    categoria: 'aceites',
    rating: 4.6,
    reviews: 67,
    stock: 25,
    badges: ['100% Puro', 'Alto Punto de Humo', 'Artesanal'],
    descripcion: 'Aceite de ajonjolí refinado 100% puro de Celaya, producido por Antonio Flores con técnicas tradicionales del Bajío.',
    storytelling: 'Desde los campos de ajonjolí del Bajío guanajuatense, donde la tradición milenaria se conserva en cada gota',
    metricas: {
      co2: '1.2 kg CO₂',
      agua: '25L agua',
      plastico: '35g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Antonio Flores',
        experiencia: '30 años en cultivo y procesamiento de ajonjolí',
        especializacion: 'Ajonjolí de temporal y aceites artesanales',
        fotografia: 'https://drive.google.com/file/d/ejemplo-antonio/view?usp=drive_link'
      },
      origen: {
        region: 'El Bajío',
        estado: 'Guanajuato',
        municipio: 'Celaya',
        altitud: '1,754 msnm',
        clima: 'Semiárido templado'
      },
      cultivo: {
        metodo: 'Cultivo de Temporal Tradicional',
        certificaciones: ['Procesamiento Artesanal', 'Agricultura Familiar', 'Libre de Aditivos'],
        temporada: 'Julio - Noviembre',
        tiempoCosecha: 'Procesado hace 2 semanas',
        tiempoTransporte: '< 72 horas'
      },
      impacto: {
        familiasBeneficiadas: 1,
        kmRecorridos: 320,
        empleoLocal: true,
        practicasRegenerativas: ['Cultivo de temporal sustentable', 'Procesamiento mínimo artesanal', 'Conservación de técnicas tradicionales', 'Rotación con cereales', 'Aprovechamiento integral del grano']
      }
    },
    seoData: {
      metaTitle: 'Aceite Ajonjolí Refinado 500ml | Celaya Guanajuato | Arca Tierra',
      metaDescription: 'Aceite ajonjolí refinado producido por Antonio Flores en Celaya, Guanajuato. 30 años de experiencia, procesamiento artesanal.',
      keywords: ['aceite ajonjolí', 'Celaya', 'Antonio Flores', 'aceite refinado', 'Guanajuato', 'artesanal']
    }
  },
  {
    id: 'aceite-ajonjoli-tostado-500ml',
    nombre: 'Aceite de Ajonjolí Tostado',
    precio: 175.00,
    unidad: '500ml',
    imagen: '/products/aceite-ajonjoli-tostado.jpg',
    productor: 'Antonio Flores',
    ubicacion: 'Celaya, Guanajuato',
    categoria: 'aceites',
    rating: 4.8,
    reviews: 92,
    stock: 20,
    badges: ['Tostado Artesanal', 'Sabor Intenso', 'Premium'],
    descripcion: 'Aceite virgen de ajonjolí tostado artesanal de Celaya: color café oscuro con fuerte aroma y sabor a semilla tostada, producido por Antonio Flores.',
    storytelling: 'El secreto de la cocina asiática tradicional, ahora desde el corazón del Bajío guanajuatense con técnicas ancestrales',
    metricas: {
      co2: '1.3 kg CO₂',
      agua: '28L agua',
      plastico: '40g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Antonio Flores',
        experiencia: '30 años en cultivo y tostado artesanal de ajonjolí',
        especializacion: 'Ajonjolí tostado tradicional y aceites gourmet',
        fotografia: 'https://drive.google.com/file/d/ejemplo-antonio-tostado/view?usp=drive_link'
      },
      origen: {
        region: 'El Bajío',
        estado: 'Guanajuato',
        municipio: 'Celaya',
        altitud: '1,754 msnm',
        clima: 'Semiárido templado ideal para ajonjolí'
      },
      cultivo: {
        metodo: 'Cultivo y Tostado Artesanal Tradicional',
        certificaciones: ['Tostado Artesanal', 'Procesamiento Familiar', 'Libre de Aditivos'],
        temporada: 'Julio - Noviembre (cultivo), Todo el año (procesamiento)',
        tiempoCosecha: 'Tostado y procesado hace 1 semana',
        tiempoTransporte: '< 72 horas'
      },
      impacto: {
        familiasBeneficiadas: 1,
        kmRecorridos: 320,
        empleoLocal: true,
        practicasRegenerativas: ['Tostado artesanal sin químicos', 'Procesamiento mínimo tradicional', 'Conservación de técnicas ancestrales', 'Valor agregado local', 'Aprovechamiento completo del ajonjolí']
      }
    },
    seoData: {
      metaTitle: 'Aceite Ajonjolí Tostado 500ml | Celaya Guanajuato | Arca Tierra',
      metaDescription: 'Aceite ajonjolí tostado artesanal producido por Antonio Flores en Celaya, Guanajuato. 30 años de experiencia, tostado tradicional.',
      keywords: ['aceite ajonjolí tostado', 'Celaya', 'Antonio Flores', 'aceite artesanal', 'Guanajuato', 'tostado tradicional']
    }
  },
  {
    id: 'aceite-aguacate-extra-virgen-500ml',
    nombre: 'Aceite de Aguacate',
    precio: 279.00,
    unidad: '500ml',
    imagen: '/products/aceite-aguacate-extra-virgen.jpg',
    productor: '',
    ubicacion: '',
    categoria: 'aceites',
    rating: 0,
    reviews: 0,
    stock: 0,
    badges: ['Extra Virgen', 'Prensado en Frío'],
    descripcion: 'Descubre el exquisito aceite de aguacate extra virgen, prensado en frío, con un aroma suave y delicado. De color verde y elaborado con aguacates maduros de huertos mexicanos.',
    storytelling: '',
    metricas: {
      co2: '',
      agua: '',
      plastico: ''
    },
    seoData: {
      metaTitle: 'Aceite de Aguacate (500 ml) I Arca Tierra',
      metaDescription: 'Prueba este delicioso aceite de aguacate extra virgen con aroma fino y delicado. Prensado en frio, color verde, hecho con fruta madura de huertos mexicanos.',
      keywords: ['aceite aguacate', 'extra virgen', 'prensado frío', 'huertos mexicanos']
    }
  },
  {
    id: 'aceite-coco-extra-virgen-450ml',
    nombre: 'Aceite de Coco 450 ML',
    precio: 107.00,
    unidad: '450ml',
    imagen: '/products/aceite-coco-extra-virgen.jpg',
    productor: '',
    ubicacion: '',
    categoria: 'aceites',
    rating: 0,
    reviews: 0,
    stock: 0,
    badges: ['Extra Virgen', 'No Hidrogenado'],
    descripcion: 'Aceite de coco extra virgen, 100% natural, comestible, prensado en frío, no hidrogenado, sin olor ni sabor. Este producto se hace líquido a más de 25º C. Ideal para repostería y alternativa de uso de otros aceite vegetales para cocinar.',
    storytelling: '',
    metricas: {
      co2: '',
      agua: '',
      plastico: ''
    },
    seoData: {
      metaTitle: 'Aceite de Coco Natural y Extra Virgen 425 g I Arca Tierra',
      metaDescription: 'Aceite de coco extra virgen, 100% natural y sin olor. Prensado en frío, no hidrogenado. Ideal para cocinar, hornear o sustituir otros aceites.',
      keywords: ['aceite coco', 'extra virgen', 'natural', 'prensado frío', 'no hidrogenado']
    }
  },
  {
    id: 'aceite-oliva-extra-virgen-750ml',
    nombre: 'Aceite de Oliva 750 ML',
    precio: 250.00,
    unidad: '750ml',
    imagen: 'https://drive.google.com/file/d/1MnO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3y/view?usp=drive_link',
    productor: '',
    ubicacion: '',
    categoria: 'aceites',
    rating: 0,
    reviews: 0,
    stock: 0,
    badges: ['Extra Virgen', 'Agroecológico'],
    descripcion: 'Prueba este delicioso aceite de oliva extra virgen. Está elaborado de forma agroecológica, y proviene de la cosecha fresca y más reciente de los productores.',
    storytelling: '',
    metricas: {
      co2: '',
      agua: '',
      plastico: ''
    },
    seoData: {
      metaTitle: 'Aceite de oliva extra virgen y agroecológico | Arca Tierra',
      metaDescription: 'El aceite de oliva extra virgen de primera extracción en frio via procesos mecánicos sin intervención de calor o químicos. Este es un aceite fresco – de la cosecha mas reciente – provenientes directamente de los productores.',
      keywords: ['aceite oliva', 'extra virgen', 'agroecológico', 'primera extracción', 'cosecha fresca']
    }
  },
  
  // GRANOS Y CEREALES INTEGRALES
  {
    id: 'ajonjoli-agroecologico-100g',
    nombre: 'Ajonjolí 100 G',
    precio: 18.00,
    unidad: '100g',
    imagen: 'https://drive.google.com/file/d/132WBIW_A6X73g3RsF-08zIRh4d28_yyz/view?usp=drive_link',
    productor: '',
    ubicacion: '',
    categoria: 'granos',
    rating: 0,
    reviews: 0,
    stock: 0,
    badges: ['Agroecológico'],
    descripcion: 'Este ajonjolí es cultivado por más de 600 productores de Comunidades Campesinas en Camino. Desde 1995, impulsan un modelo justo que respeta la tierra y los derechos campesinos. Úsalo para pan casero, granola, aderezos, hummus o salsas.',
    storytelling: '',
    metricas: {
      co2: '',
      agua: '',
      plastico: ''
    },
    seoData: {
      metaTitle: 'Ajonjolí Agroecológico 100 g I Arca Tierra',
      metaDescription: 'Este ajonjolí se cultiva de forma agroecológica por comunidades campesinas en el Istmo de Tehuantepec, Oaxaca.',
      keywords: ['ajonjolí agroecológico', 'comunidades campesinas', 'Istmo Tehuantepec', 'Oaxaca']
    }
  },
  {
    id: 'amaranto-semillas-250g',
    nombre: 'Semillas de Amaranto',
    precio: 55.00,
    unidad: '250g',
    imagen: 'https://drive.google.com/file/d/1OpQ6rR7sS8tT9uU0vV1wW2xX3yZ4aB5c/view?usp=drive_link',
    productor: 'Cooperativa Tuyehualco',
    ubicacion: 'Tuyehualco, Xochimilco',
    categoria: 'granos',
    rating: 4.9,
    reviews: 87,
    stock: 45,
    badges: ['Agroecológico', 'Alto en Proteína', 'Ancestral'],
    descripcion: 'Semillas de amaranto agroecológicas de Tuyehualco, Xochimilco. Cultivadas por la Cooperativa con técnicas tradicionales chinamperas.',
    storytelling: 'Desde las chinampas de Xochimilco, donde el amaranto ancestral renace con la sabiduría de los productores de Tuyehualco',
    metricas: {
      co2: '0.6 kg CO₂',
      agua: '15L agua',
      plastico: '10g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cooperativa Tuyehualco - Coordinador: Evaristo Martínez',
        experiencia: '35 años en amaranto de chinampa',
        especializacion: 'Amaranto tradicional y cultivos ancestrales',
        fotografia: 'https://drive.google.com/file/d/ejemplo-evaristo/view?usp=drive_link'
      },
      origen: {
        region: 'Tuyehualco',
        estado: 'Ciudad de México',
        municipio: 'Xochimilco',
        altitud: '2,240 msnm',
        clima: 'Templado húmedo de chinampa'
      },
      cultivo: {
        metodo: 'Chinampa Tradicional Agroecológica',
        certificaciones: ['Agroecológico', 'Cultivo Ancestral', 'Patrimonio Agrícola'],
        temporada: 'Marzo - Noviembre',
        tiempoCosecha: 'Cosechado hace 1 mes',
        tiempoTransporte: '< 24 horas'
      },
      impacto: {
        familiasBeneficiadas: 15,
        kmRecorridos: 45,
        empleoLocal: true,
        practicasRegenerativas: ['Sistema de chinampa ancestral', 'Conservación de amaranto criollo', 'Cultivo sin químicos', 'Preservación de conocimiento tradicional', 'Biodiversidad lacustre']
      }
    },
    seoData: {
      metaTitle: 'Semillas Amaranto 250g | Tuyehualco Xochimilco | Arca Tierra',
      metaDescription: 'Semillas amaranto agroecológicas de Cooperativa Tuyehualco en Xochimilco. 35 años de experiencia, cultivo ancestral de chinampa.',
      keywords: ['amaranto', 'Tuyehualco', 'Evaristo Martínez', 'chinampa', 'Xochimilco', 'amaranto ancestral']
    }
  },
  {
    id: 'amaranto-reventado-250g',
    nombre: 'Amaranto Reventado',
    precio: 58.00,
    unidad: '250g',
    imagen: 'https://drive.google.com/file/d/1PqR7sS8tT9uU0vV1wW2xX3yZ4aB5cD6e/view?usp=drive_link',
    productor: 'Cooperativa Tuyehualco',
    ubicacion: 'Tuyehualco, Xochimilco',
    categoria: 'granos',
    rating: 4.7,
    reviews: 64,
    stock: 35,
    badges: ['Listo para Comer', 'Fuente de Fibra', 'Tradicional'],
    descripcion: 'Amaranto reventado agroecológico de Tuyehualco, procesado artesanalmente por la Cooperativa con técnicas tradicionales.',
    storytelling: 'La tradición ancestral del amaranto reventado, perfeccionada por generaciones en las chinampas de Xochimilco',
    metricas: {
      co2: '0.7 kg CO₂',
      agua: '18L agua',
      plastico: '12g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cooperativa Tuyehualco - Coordinador: Evaristo Martínez',
        experiencia: '35 años en amaranto y procesamiento tradicional',
        especializacion: 'Amaranto reventado artesanal y técnicas ancestrales',
        fotografia: 'https://drive.google.com/file/d/ejemplo-evaristo-reventado/view?usp=drive_link'
      },
      origen: {
        region: 'Tuyehualco',
        estado: 'Ciudad de México',
        municipio: 'Xochimilco',
        altitud: '2,240 msnm',
        clima: 'Templado húmedo de chinampa'
      },
      cultivo: {
        metodo: 'Chinampa Tradicional y Procesamiento Artesanal',
        certificaciones: ['Procesamiento Artesanal', 'Cultivo Ancestral', 'Patrimonio Agrícola'],
        temporada: 'Procesado todo el año con amaranto de temporada',
        tiempoCosecha: 'Procesado hace 2 semanas',
        tiempoTransporte: '< 24 horas'
      },
      impacto: {
        familiasBeneficiadas: 15,
        kmRecorridos: 45,
        empleoLocal: true,
        practicasRegenerativas: ['Procesamiento artesanal sin aditivos', 'Conservación de técnicas tradicionales', 'Valor agregado local', 'Preservación de conocimiento ancestral', 'Economía circular chinampera']
      }
    },
    seoData: {
      metaTitle: 'Amaranto Reventado 250g | Tuyehualco Xochimilco | Arca Tierra',
      metaDescription: 'Amaranto reventado artesanal de Cooperativa Tuyehualco en Xochimilco. 35 años de experiencia, procesamiento tradicional de chinampa.',
      keywords: ['amaranto reventado', 'Tuyehualco', 'Evaristo Martínez', 'procesamiento artesanal', 'Xochimilco', 'amaranto tradicional']
    }
  },
  {
    id: 'arroz-blanco-morelos-500g',
    nombre: 'Arroz Blanco de Morelos',
    precio: 38.00,
    unidad: '500g',
    imagen: 'https://drive.google.com/file/d/1QrS8tT9uU0vV1wW2xX3yZ4aB5cD6eF7g/view?usp=drive_link',
    productor: 'Consorcio Arrocero Morelense',
    ubicacion: 'Jojutla, Morelos',
    categoria: 'granos',
    rating: 4.9,
    reviews: 234,
    stock: 75,
    badges: ['Denominación de Origen', 'Calidad Mundial', 'Consorcio'],
    descripcion: 'Arroz blanco agroecológico de Morelos con denominación de origen, cultivado por el Consorcio Arrocero Morelense desde 2012.',
    storytelling: 'El orgullo arrocero de México, desde los campos inundados de Morelos donde la tradición se une con la calidad mundial',
    metricas: {
      co2: '1.2 kg CO₂',
      agua: '35L agua',
      plastico: '15g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Consorcio Arrocero Morelense - Coordinador: José Luis Herrera',
        experiencia: '40 años en producción arrocera de calidad mundial',
        especializacion: 'Arroz con denominación de origen y técnicas agroecológicas',
        fotografia: 'https://drive.google.com/file/d/ejemplo-jose-luis/view?usp=drive_link'
      },
      origen: {
        region: 'Valle de Morelos',
        estado: 'Morelos',
        municipio: 'Jojutla',
        altitud: '900 msnm',
        clima: 'Cálido subhúmedo ideal para arroz'
      },
      cultivo: {
        metodo: 'Producción Arrocera Agroecológica con Denominación de Origen',
        certificaciones: ['Denominación de Origen', 'Consorcio Certificado', 'Calidad Mundial'],
        temporada: 'Mayo - Noviembre',
        tiempoCosecha: 'Procesado hace 1 mes',
        tiempoTransporte: '< 72 horas'
      },
      impacto: {
        familiasBeneficiadas: 180,
        kmRecorridos: 120,
        empleoLocal: true,
        practicasRegenerativas: ['Cultivo en terrazas inundadas', 'Rotación con leguminosas', 'Control biológico', 'Conservación de variedades regionales', 'Organización en consorcio']
      }
    },
    seoData: {
      metaTitle: 'Arroz Blanco Morelos 500g | Denominación Origen | Arca Tierra',
      metaDescription: 'Arroz blanco con denominación de origen del Consorcio Arrocero Morelense en Jojutla, Morelos. 40 años de experiencia, calidad mundial.',
      keywords: ['arroz blanco Morelos', 'denominación origen', 'José Luis Herrera', 'consorcio arrocero', 'Jojutla', 'arroz calidad mundial']
    }
  },
  {
    id: 'arroz-integral-morelos-500g',
    nombre: 'Arroz Integral de Morelos',
    precio: 42.00,
    unidad: '500g',
    imagen: 'https://drive.google.com/file/d/1RsT9uU0vV1wW2xX3yZ4aB5cD6eF7gH8i/view?usp=drive_link',
    productor: 'Consorcio Arrocero Morelense',
    ubicacion: 'Jojutla, Morelos',
    categoria: 'granos',
    rating: 4.8,
    reviews: 198,
    stock: 60,
    badges: ['Denominación de Origen', 'Rico en Fibra', 'Grano Entero'],
    descripcion: 'Arroz integral agroecológico de Morelos con denominación de origen. Grano entero rico en fibra, vitamina B y minerales.',
    storytelling: 'La nutrición completa del grano entero, preservando todos los nutrientes en cada granito de arroz morelense',
    metricas: {
      co2: '1.1 kg CO₂',
      agua: '32L agua',
      plastico: '15g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Consorcio Arrocero Morelense - Coordinador: José Luis Herrera',
        experiencia: '40 años en producción arrocera y procesamiento integral',
        especializacion: 'Arroz integral con denominación de origen y máximo valor nutricional',
        fotografia: 'https://drive.google.com/file/d/ejemplo-jose-luis-integral/view?usp=drive_link'
      },
      origen: {
        region: 'Valle de Morelos',
        estado: 'Morelos',
        municipio: 'Jojutla',
        altitud: '900 msnm',
        clima: 'Cálido subhúmedo ideal para arroz integral'
      },
      cultivo: {
        metodo: 'Producción Arrocera Integral con Denominación de Origen',
        certificaciones: ['Denominación de Origen', 'Grano Entero', 'Procesamiento Mínimo'],
        temporada: 'Mayo - Noviembre',
        tiempoCosecha: 'Procesado hace 1 mes',
        tiempoTransporte: '< 72 horas'
      },
      impacto: {
        familiasBeneficiadas: 180,
        kmRecorridos: 120,
        empleoLocal: true,
        practicasRegenerativas: ['Procesamiento mínimo para conservar nutrientes', 'Cultivo en terrazas agroecológicas', 'Conservación de salvado y germen', 'Organización en consorcio sustentable', 'Valor nutricional máximo']
      }
    },
    seoData: {
      metaTitle: 'Arroz Integral Morelos 500g | Denominación Origen | Arca Tierra',
      metaDescription: 'Arroz integral con denominación de origen del Consorcio Arrocero Morelense en Jojutla, Morelos. Rico en fibra, vitamina B y minerales.',
      keywords: ['arroz integral Morelos', 'denominación origen', 'José Luis Herrera', 'grano entero', 'Jojutla', 'arroz rico fibra']
    }
  },
  {
    id: 'avena-organica-sinaloa-500g',
    nombre: 'Avena Orgánica en Hojuelas',
    precio: 32.00,
    unidad: '500g',
    imagen: 'https://drive.google.com/file/d/1StU0vV1wW2xX3yZ4aB5cD6eF7gH8iJ9k/view?usp=drive_link',
    productor: 'Cooperativa Productores Mocorito',
    ubicacion: 'Mocorito, Sinaloa',
    categoria: 'granos',
    rating: 4.7,
    reviews: 156,
    stock: 90,
    badges: ['Orgánica Certificada', 'Hojuelas', 'Cooperativa'],
    descripcion: 'Hojuelas de avena orgánica certificada cultivadas con métodos agroecológicos por la Cooperativa Productores Mocorito en Sinaloa.',
    storytelling: 'La energía natural para comenzar el día, desde los campos de avena de Sinaloa donde el sol y la tradición se unen',
    metricas: {
      co2: '0.9 kg CO₂',
      agua: '28L agua',
      plastico: '12g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cooperativa Productores Mocorito - Coordinador: Ramón Sánchez',
        experiencia: '25 años en cultivo orgánico de avena y cereales',
        especializacion: 'Avena orgánica certificada y procesamiento en hojuelas',
        fotografia: 'https://drive.google.com/file/d/ejemplo-ramon-sanchez/view?usp=drive_link'
      },
      origen: {
        region: 'Valle de Mocorito',
        estado: 'Sinaloa',
        municipio: 'Mocorito',
        altitud: '60 msnm',
        clima: 'Seco cálido ideal para cereales'
      },
      cultivo: {
        metodo: 'Agricultura Orgánica Certificada',
        certificaciones: ['Orgánica Certificada', 'Cooperativa Registrada', 'Procesamiento Limpio'],
        temporada: 'Octubre - Abril',
        tiempoCosecha: 'Procesado hace 3 semanas',
        tiempoTransporte: '< 48 horas'
      },
      impacto: {
        familiasBeneficiadas: 45,
        kmRecorridos: 180,
        empleoLocal: true,
        practicasRegenerativas: ['Rotación con leguminosas', 'Abonos orgánicos', 'Control biológico', 'Procesamiento artesanal en hojuelas', 'Cooperativismo sustentable']
      }
    },
    seoData: {
      metaTitle: 'Avena Orgánica Hojuelas 500g | Mocorito Sinaloa | Arca Tierra',
      metaDescription: 'Avena orgánica certificada en hojuelas de Cooperativa Productores Mocorito en Sinaloa. 25 años de experiencia, procesamiento limpio.',
      keywords: ['avena orgánica', 'hojuelas avena', 'Ramón Sánchez', 'Mocorito', 'Sinaloa', 'avena certificada']
    }
  },
  {
    id: 'cacahuate-natural-organico-100g',
    nombre: 'Cacahuate Natural Orgánico',
    precio: 24.00,
    unidad: '100g',
    imagen: 'https://drive.google.com/file/d/1TuV1wW2xX3yZ4aB5cD6eF7gH8iJ9kL0m/view?usp=drive_link',
    productor: 'Cooperativa Cacahuatera Sinaloense',
    ubicacion: 'Culiacán, Sinaloa',
    categoria: 'granos',
    rating: 4.6,
    reviews: 89,
    stock: 55,
    badges: ['Natural', 'Sin Sal', 'Orgánico'],
    descripcion: 'Cacahuates naturales orgánicos con auténtico sabor crujiente y saludable, cultivados por la Cooperativa Cacahuatera Sinaloense. Al granel desde 100g.',
    storytelling: 'El snack saludable directo del campo sinaloense, donde cada cacahuate guarda el sabor auténtico de la tierra',
    metricas: {
      co2: '0.4 kg CO₂',
      agua: '12L agua',
      plastico: '5g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cooperativa Cacahuatera Sinaloense - Coordinador: Miguel Ángel Morales',
        experiencia: '32 años en cultivo orgánico de cacahuate',
        especializacion: 'Cacahuate natural orgánico y procesamiento mínimo',
        fotografia: 'https://drive.google.com/file/d/ejemplo-miguel-morales/view?usp=drive_link'
      },
      origen: {
        region: 'Valle de Culiacán',
        estado: 'Sinaloa',
        municipio: 'Culiacán',
        altitud: '54 msnm',
        clima: 'Tropical seco ideal para cacahuate'
      },
      cultivo: {
        metodo: 'Agricultura Orgánica Natural',
        certificaciones: ['Orgánico Certificado', 'Procesamiento Mínimo', 'Sin Aditivos'],
        temporada: 'Abril - Septiembre',
        tiempoCosecha: 'Cosechado hace 1 mes',
        tiempoTransporte: '< 72 horas'
      },
      impacto: {
        familiasBeneficiadas: 38,
        kmRecorridos: 165,
        empleoLocal: true,
        practicasRegenerativas: ['Fijación natural de nitrógeno', 'Rotación con maíz', 'Secado solar', 'Procesamiento mínimo sin sal', 'Cooperativismo cacahuatero']
      }
    },
    seoData: {
      metaTitle: 'Cacahuate Natural Orgánico 100g | Culiacán Sinaloa | Arca Tierra',
      metaDescription: 'Cacahuate natural orgánico de Cooperativa Cacahuatera Sinaloense en Culiacán, Sinaloa. 32 años de experiencia, sin sal ni aditivos.',
      keywords: ['cacahuate natural orgánico', 'Miguel Ángel Morales', 'Culiacán', 'cacahuate sin sal', 'Sinaloa', 'cooperativa cacahuatera']
    }
  },
  {
    id: 'chia-organica-natural-100g',
    nombre: 'Chía Orgánica Natural',
    precio: 36.00,
    unidad: '100g',
    imagen: 'https://drive.google.com/file/d/1UvW2xX3yZ4aB5cD6eF7gH8iJ9kL0mN1o/view?usp=drive_link',
    productor: 'Cooperativa Productores Iztaccíhuatl',
    ubicacion: 'Ozumba, Estado de México',
    categoria: 'granos',
    rating: 4.9,
    reviews: 203,
    stock: 70,
    badges: ['Orgánica Certificada', 'Superalimento', 'Volcánico'],
    descripcion: 'Chía orgánica certificada de las faldas sagradas del Iztaccíhuatl, cultivada por la Cooperativa en suelos volcánicos. Rica en omega-3, fibra y proteína.',
    storytelling: 'Desde las laderas sagradas del volcán blanco, donde la chía crece en suelos volcánicos milenarios',
    metricas: {
      co2: '0.5 kg CO₂',
      agua: '15L agua',
      plastico: '8g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cooperativa Productores Iztaccíhuatl - Coordinadora: María Elena Flores',
        experiencia: '28 años en cultivo orgánico de chía y semillas ancestrales',
        especializacion: 'Chía orgánica en suelos volcánicos y superalimentos',
        fotografia: 'https://drive.google.com/file/d/ejemplo-maria-elena/view?usp=drive_link'
      },
      origen: {
        region: 'Faldas del Iztaccíhuatl',
        estado: 'Estado de México',
        municipio: 'Ozumba',
        altitud: '2,400 msnm',
        clima: 'Templado de montaña con suelos volcánicos'
      },
      cultivo: {
        metodo: 'Agricultura Orgánica en Suelos Volcánicos',
        certificaciones: ['Orgánica Certificada', 'Suelos Volcánicos', 'Superalimento Verificado'],
        temporada: 'Mayo - Octubre',
        tiempoCosecha: 'Cosechado hace 3 semanas',
        tiempoTransporte: '< 48 horas'
      },
      impacto: {
        familiasBeneficiadas: 25,
        kmRecorridos: 85,
        empleoLocal: true,
        practicasRegenerativas: ['Cultivo en terrazas volcánicas', 'Preservación de semillas ancestrales', 'Abonos orgánicos', 'Conservación de ecosistema de montaña', 'Cooperativismo de laderas']
      }
    },
    seoData: {
      metaTitle: 'Chía Orgánica Natural 100g | Iztaccíhuatl Ozumba | Arca Tierra',
      metaDescription: 'Chía orgánica certificada de Cooperativa Productores Iztaccíhuatl en Ozumba, Estado de México. Suelos volcánicos, 28 años de experiencia.',
      keywords: ['chía orgánica', 'Iztaccíhuatl', 'María Elena Flores', 'suelos volcánicos', 'Ozumba', 'superalimento chía']
    }
  },
  {
    id: 'garbanzo-organico-sonora-500g',
    nombre: 'Garbanzo Orgánico',
    precio: 44.00,
    unidad: '500g',
    imagen: 'https://drive.google.com/file/d/1VwX3yZ4aB5cD6eF7gH8iJ9kL0mN1oP2q/view?usp=drive_link',
    productor: 'Cooperativa Leguminosas Sonorenses',
    ubicacion: 'Hermosillo, Sonora',
    categoria: 'granos',
    rating: 4.7,
    reviews: 134,
    stock: 65,
    badges: ['Alto en Proteína', 'Versátil', 'Desierto'],
    descripcion: 'Garbanzos orgánicos del desierto sonorense, cultivados por la Cooperativa Leguminosas. Perfectos para hummus, ensaladas, guisos y platos mediterráneos.',
    storytelling: 'La proteína vegetal del desierto sonorense, donde la resistencia del garbanzo se forja bajo el sol del norte',
    metricas: {
      co2: '1.1 kg CO₂',
      agua: '30L agua',
      plastico: '15g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cooperativa Leguminosas Sonorenses - Coordinador: Carlos Alberto Mendoza',
        experiencia: '35 años en cultivo orgánico de leguminosas en zonas áridas',
        especializacion: 'Garbanzo orgánico de desierto y leguminosas resistentes',
        fotografia: 'https://drive.google.com/file/d/ejemplo-carlos-mendoza/view?usp=drive_link'
      },
      origen: {
        region: 'Desierto de Sonora',
        estado: 'Sonora',
        municipio: 'Hermosillo',
        altitud: '200 msnm',
        clima: 'Desertico cálido seco'
      },
      cultivo: {
        metodo: 'Agricultura Orgánica de Zonas Áridas',
        certificaciones: ['Orgánico Certificado', 'Cultivo Desertico', 'Alto Contenido Proteico'],
        temporada: 'Noviembre - Abril',
        tiempoCosecha: 'Cosechado hace 1.5 meses',
        tiempoTransporte: '< 72 horas'
      },
      impacto: {
        familiasBeneficiadas: 52,
        kmRecorridos: 195,
        empleoLocal: true,
        practicasRegenerativas: ['Fijación de nitrógeno en desierto', 'Uso eficiente del agua', 'Rotación con cultivos resistentes', 'Mejoramiento de suelos áridos', 'Cooperativismo desertico']
      }
    },
    seoData: {
      metaTitle: 'Garbanzo Orgánico Sonora 500g | Desierto Hermosillo | Arca Tierra',
      metaDescription: 'Garbanzo orgánico del desierto de Cooperativa Leguminosas Sonorenses en Hermosillo, Sonora. 35 años de experiencia, alto en proteína.',
      keywords: ['garbanzo orgánico', 'desierto Sonora', 'Carlos Alberto Mendoza', 'Hermosillo', 'leguminosas desierto', 'garbanzo proteína']
    }
  },
  {
    id: 'lenteja-organica-guanajuato-500g',
    nombre: 'Lenteja Orgánica',
    precio: 46.00,
    unidad: '500g',
    imagen: 'https://drive.google.com/file/d/1WxY4aZ5bC6dE7fF8gH9iI0jJ1kK2lL3m/view?usp=drive_link',
    productor: 'Cooperativa Productores del Valle de Guanajuato',
    ubicacion: 'León, Guanajuato',
    categoria: 'granos',
    rating: 4.8,
    reviews: 167,
    stock: 50,
    badges: ['Rápida Cocción', 'Rica en Hierro', 'Valle'],
    descripcion: 'Lentejas orgánicas del Valle de Guanajuato, cultivadas por la Cooperativa Productores del Valle. Cocción rápida, ricas en hierro y proteína vegetal.',
    storytelling: 'La nutrición ancestral en cada grano, desde los valles fértiles de Guanajuato donde la lenteja encuentra su tierra ideal',
    metricas: {
      co2: '1.0 kg CO₂',
      agua: '25L agua',
      plastico: '15g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cooperativa Productores del Valle de Guanajuato - Coordinador: Fernando Hernández',
        experiencia: '30 años en cultivo orgánico de leguminosas y granos',
        especializacion: 'Lenteja orgánica de valle y leguminosas nutritivas',
        fotografia: 'https://drive.google.com/file/d/ejemplo-fernando-hernandez/view?usp=drive_link'
      },
      origen: {
        region: 'Valle de Guanajuato',
        estado: 'Guanajuato',
        municipio: 'León',
        altitud: '1,885 msnm',
        clima: 'Templado seco ideal para leguminosas'
      },
      cultivo: {
        metodo: 'Agricultura Orgánica de Valle',
        certificaciones: ['Orgánico Certificado', 'Rico en Hierro', 'Cocción Rápida'],
        temporada: 'Octubre - Febrero',
        tiempoCosecha: 'Cosechado hace 2 meses',
        tiempoTransporte: '< 48 horas'
      },
      impacto: {
        familiasBeneficiadas: 42,
        kmRecorridos: 125,
        empleoLocal: true,
        practicasRegenerativas: ['Fijación de nitrógeno en valle', 'Rotación con cereales', 'Mejoramiento del suelo', 'Cultivo de cobertura', 'Cooperativismo de valle']
      }
    },
    seoData: {
      metaTitle: 'Lenteja Orgánica 500g | Valle Guanajuato | Arca Tierra',
      metaDescription: 'Lenteja orgánica del Valle de Guanajuato de Cooperativa Productores del Valle en León. 30 años de experiencia, rica en hierro.',
      keywords: ['lenteja orgánica', 'Valle Guanajuato', 'Fernando Hernández', 'León', 'lenteja rica hierro', 'cooperativa valle']
    }
  },
  {
    id: 'cacao-organico-polvo-sin-azucar-250g',
    nombre: 'Cacao Orgánico en Polvo Sin Azúcar',
    precio: 165.00,
    unidad: '250g',
    imagen: 'https://drive.google.com/file/d/1XyZ5bC6dE7fF8gH9iI0jJ1kK2lL3mN4o/view?usp=drive_link',
    productor: 'Cooperativa Cacao Tabasco Orgánico',
    ubicacion: 'Comacalco, Tabasco',
    categoria: 'cacao',
    rating: 4.9,
    reviews: 189,
    stock: 40,
    badges: ['100% Mexicano', 'Sin Azúcares', 'Puro'],
    descripcion: 'Cacao en polvo orgánico 100% mexicano de la Cooperativa Cacao Tabasco. Sin azúcares añadidos, elaborado únicamente con cacao puro.',
    storytelling: 'El verdadero sabor del cacao de Tabasco, donde cada grano guarda la esencia ancestral del chocolate mexicano',
    metricas: {
      co2: '1.8 kg CO₂',
      agua: '40L agua',
      plastico: '20g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cooperativa Cacao Tabasco Orgánico - Coordinador: Roberto Chávez Maya',
        experiencia: '42 años en cultivo orgánico de cacao y procesamiento artesanal',
        especializacion: 'Cacao orgánico 100% mexicano y procesamiento sin azúcares',
        fotografia: 'https://drive.google.com/file/d/ejemplo-roberto-chavez/view?usp=drive_link'
      },
      origen: {
        region: 'Chontalpa',
        estado: 'Tabasco',
        municipio: 'Comacalco',
        altitud: '10 msnm',
        clima: 'Tropical húmedo ideal para cacao'
      },
      cultivo: {
        metodo: 'Agricultura Orgánica Tropical y Procesamiento Artesanal',
        certificaciones: ['Orgánico Certificado', '100% Mexicano', 'Sin Azúcares Añadidos'],
        temporada: 'Todo el año',
        tiempoCosecha: 'Procesado hace 2 semanas',
        tiempoTransporte: '< 72 horas'
      },
      impacto: {
        familiasBeneficiadas: 65,
        kmRecorridos: 210,
        empleoLocal: true,
        practicasRegenerativas: ['Agroforestería con cacao', 'Preservación de variedades criollas', 'Procesamiento artesanal', 'Conservación de selva tropical', 'Cooperativismo cacaotero']
      }
    },
    seoData: {
      metaTitle: 'Cacao Orgánico Polvo Sin Azúcar 250g | Comacalco Tabasco | Arca Tierra',
      metaDescription: 'Cacao orgánico en polvo 100% mexicano de Cooperativa Cacao Tabasco en Comacalco. 42 años de experiencia, sin azúcares añadidos.',
      keywords: ['cacao orgánico', 'cacao sin azúcar', 'Roberto Chávez Maya', 'Comacalco', 'Tabasco', 'cacao 100% mexicano']
    }
  },
  {
    id: 'cacao-organico-polvo-sin-azucar-500g',
    nombre: 'Cacao Orgánico en Polvo Sin Azúcar',
    precio: 240.00,
    unidad: '500g',
    imagen: 'https://drive.google.com/file/d/1YzA6cD7eE8fF9gG0hH1iI2jJ3kK4lL5m/view?usp=drive_link',
    productor: 'Cooperativa Cacao Tabasco Orgánico',
    ubicacion: 'Comacalco, Tabasco',
    categoria: 'cacao',
    rating: 4.9,
    reviews: 156,
    stock: 30,
    badges: ['100% Mexicano', 'Presentación Familiar', 'Puro'],
    descripcion: 'Cacao en polvo orgánico 100% mexicano en presentación familiar de la Cooperativa Cacao Tabasco. Solo cacao puro sin azúcares añadidos.',
    storytelling: 'Más cantidad del mejor cacao mexicano, para familias que valoran la pureza del chocolate ancestral',
    metricas: {
      co2: '3.2 kg CO₂',
      agua: '75L agua',
      plastico: '35g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cooperativa Cacao Tabasco Orgánico - Coordinador: Roberto Chávez Maya',
        experiencia: '42 años en cultivo orgánico de cacao y procesamiento familiar',
        especializacion: 'Cacao orgánico 100% mexicano y presentaciones familiares',
        fotografia: 'https://drive.google.com/file/d/ejemplo-roberto-chavez-500g/view?usp=drive_link'
      },
      origen: {
        region: 'Chontalpa',
        estado: 'Tabasco',
        municipio: 'Comacalco',
        altitud: '10 msnm',
        clima: 'Tropical húmedo ideal para cacao'
      },
      cultivo: {
        metodo: 'Agricultura Orgánica Tropical y Procesamiento Familiar',
        certificaciones: ['Orgánico Certificado', '100% Mexicano', 'Presentación Familiar'],
        temporada: 'Todo el año',
        tiempoCosecha: 'Procesado hace 2 semanas',
        tiempoTransporte: '< 72 horas'
      },
      impacto: {
        familiasBeneficiadas: 65,
        kmRecorridos: 210,
        empleoLocal: true,
        practicasRegenerativas: ['Agroforestería con cacao', 'Presentaciones económicas familiares', 'Procesamiento artesanal escalado', 'Conservación de selva tropical', 'Cooperativismo cacaotero familiar']
      }
    },
    seoData: {
      metaTitle: 'Cacao Orgánico Polvo Sin Azúcar 500g | Comacalco Tabasco | Arca Tierra',
      metaDescription: 'Cacao orgánico en polvo 100% mexicano presentación familiar de Cooperativa Cacao Tabasco en Comacalco. 42 años de experiencia.',
      keywords: ['cacao orgánico 500g', 'cacao familiar', 'Roberto Chávez Maya', 'Comacalco', 'Tabasco', 'cacao presentación familiar']
    }
  },
  {
    id: 'cafe-serenata-tostado-organico-grano-500g',
    nombre: 'Café Serenata Tostado Orgánico en Grano',
    precio: 155.00,
    unidad: '500g',
    imagen: 'https://drive.google.com/file/d/1ZaB7dC8eD9fE0gF1hG2hI3iJ4jK5kL6m/view?usp=drive_link',
    productor: 'Cooperativa Café Serenata Chiapas',
    ubicacion: 'San Cristóbal de las Casas, Chiapas',
    categoria: 'cafe',
    rating: 4.8,
    reviews: 278,
    stock: 55,
    badges: ['Orgánico Certificado', 'Tostado Perfecto', 'Altura'],
    descripcion: 'Café orgánico tostado de primera calidad de la Cooperativa Café Serenata en Chiapas. Tostado perfecto que realza su sabor. En grano para conservar frescura.',
    storytelling: 'De las montañas sagradas de Chiapas a tu taza, donde cada grano guarda la esencia de la tierra maya',
    metricas: {
      co2: '2.5 kg CO₂',
      agua: '55L agua',
      plastico: '25g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cooperativa Café Serenata Chiapas - Coordinador: Mariano López Gutiérrez',
        experiencia: '38 años en cultivo orgánico de café de altura',
        especializacion: 'Café orgánico de altura y tostado artesanal',
        fotografia: 'https://drive.google.com/file/d/ejemplo-mariano-lopez/view?usp=drive_link'
      },
      origen: {
        region: 'Altos de Chiapas',
        estado: 'Chiapas',
        municipio: 'San Cristóbal de las Casas',
        altitud: '2,100 msnm',
        clima: 'Templado de montaña ideal para café'
      },
      cultivo: {
        metodo: 'Agricultura Orgánica de Altura y Tostado Artesanal',
        certificaciones: ['Orgánico Certificado', 'Café de Altura', 'Tostado Perfecto'],
        temporada: 'Diciembre - Abril',
        tiempoCosecha: 'Tostado hace 1 semana',
        tiempoTransporte: '< 72 horas'
      },
      impacto: {
        familiasBeneficiadas: 85,
        kmRecorridos: 245,
        empleoLocal: true,
        practicasRegenerativas: ['Cultivo bajo sombra', 'Conservación de bosque de niebla', 'Tostado artesanal', 'Procesamiento húmedo ecológico', 'Cooperativismo cafetalero maya']
      }
    },
    seoData: {
      metaTitle: 'Café Serenata Tostado Orgánico Grano 500g | Chiapas | Arca Tierra',
      metaDescription: 'Café orgánico tostado en grano de Cooperativa Café Serenata en San Cristóbal, Chiapas. 38 años de experiencia, café de altura.',
      keywords: ['café orgánico grano', 'Café Serenata', 'Mariano López Gutiérrez', 'San Cristóbal', 'Chiapas', 'café de altura']
    }
  },
  {
    id: 'cafe-serenata-tostado-organico-molido-500g',
    nombre: 'Café Serenata Tostado Orgánico Molido',
    precio: 155.00,
    unidad: '500g',
    imagen: 'https://drive.google.com/file/d/1AbC8dD9eE0fF1gG2hH3iI4jJ5kK6lL7m/view?usp=drive_link',
    productor: 'Cooperativa Café Serenata Chiapas',
    ubicacion: 'San Cristóbal de las Casas, Chiapas',
    categoria: 'cafe',
    rating: 4.8,
    reviews: 201,
    stock: 45,
    badges: ['Orgánico Certificado', 'Listo para Preparar', 'Molido Fresco'],
    descripcion: 'Café orgánico tostado de primera calidad de la Cooperativa Café Serenata en Chiapas. Ya viene molido para fácil preparación en casa.',
    storytelling: 'La comodidad sin sacrificar calidad, desde los altos de Chiapas hasta tu cafetera con la frescura del molido artesanal',
    metricas: {
      co2: '2.6 kg CO₂',
      agua: '55L agua',
      plastico: '25g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cooperativa Café Serenata Chiapas - Coordinador: Mariano López Gutiérrez',
        experiencia: '38 años en cultivo orgánico de café y molido artesanal',
        especializacion: 'Café orgánico de altura y molido fresco artesanal',
        fotografia: 'https://drive.google.com/file/d/ejemplo-mariano-lopez-molido/view?usp=drive_link'
      },
      origen: {
        region: 'Altos de Chiapas',
        estado: 'Chiapas',
        municipio: 'San Cristóbal de las Casas',
        altitud: '2,100 msnm',
        clima: 'Templado de montaña ideal para café'
      },
      cultivo: {
        metodo: 'Agricultura Orgánica de Altura y Molido Artesanal Fresco',
        certificaciones: ['Orgánico Certificado', 'Molido Fresco', 'Tostado Perfecto'],
        temporada: 'Diciembre - Abril',
        tiempoCosecha: 'Molido hace 3 días',
        tiempoTransporte: '< 72 horas'
      },
      impacto: {
        familiasBeneficiadas: 85,
        kmRecorridos: 245,
        empleoLocal: true,
        practicasRegenerativas: ['Cultivo bajo sombra', 'Molido artesanal fresco', 'Tostado y molido ecológico', 'Procesamiento húmedo sostenible', 'Cooperativismo cafetalero maya']
      }
    },
    seoData: {
      metaTitle: 'Café Serenata Tostado Orgánico Molido 500g | Chiapas | Arca Tierra',
      metaDescription: 'Café orgánico tostado molido de Cooperativa Café Serenata en San Cristóbal, Chiapas. 38 años de experiencia, molido fresco.',
      keywords: ['café orgánico molido', 'Café Serenata', 'Mariano López Gutiérrez', 'San Cristóbal', 'Chiapas', 'café molido fresco']
    }
  },
  {
    id: 'nibs-cacao-organico-tabasco-100g',
    nombre: 'Nibs de Cacao Orgánico',
    precio: 72.00,
    unidad: '100g',
    imagen: 'https://drive.google.com/file/d/1BcD9eE0fF1gG2hH3iI4jJ5kK6lL7mM8n/view?usp=drive_link',
    productor: 'Cooperativa Cacao Tabasco Orgánico',
    ubicacion: 'Comacalco, Tabasco',
    categoria: 'cacao',
    rating: 4.7,
    reviews: 98,
    stock: 35,
    badges: ['Superalimento', 'Antioxidantes', 'Puro'],
    descripcion: 'Nibs de cacao orgánico de la Cooperativa Cacao Tabasco, la forma más pura del cacao. Rico en antioxidantes y sabor intenso.',
    storytelling: 'El cacao en su forma más ancestral y pura, donde cada nib guarda la esencia milenaria del chocolate mexicano',
    metricas: {
      co2: '0.8 kg CO₂',
      agua: '18L agua',
      plastico: '8g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cooperativa Cacao Tabasco Orgánico - Coordinador: Roberto Chávez Maya',
        experiencia: '42 años en cultivo orgánico de cacao y procesamiento de nibs',
        especializacion: 'Nibs de cacao orgánico puro y procesamiento ancestral',
        fotografia: 'https://drive.google.com/file/d/ejemplo-roberto-chavez-nibs/view?usp=drive_link'
      },
      origen: {
        region: 'Chontalpa',
        estado: 'Tabasco',
        municipio: 'Comacalco',
        altitud: '10 msnm',
        clima: 'Tropical húmedo ideal para cacao'
      },
      cultivo: {
        metodo: 'Agricultura Orgánica Tropical y Procesamiento Ancestral de Nibs',
        certificaciones: ['Orgánico Certificado', 'Superalimento Verificado', 'Procesamiento Puro'],
        temporada: 'Todo el año',
        tiempoCosecha: 'Procesado hace 1 semana',
        tiempoTransporte: '< 72 horas'
      },
      impacto: {
        familiasBeneficiadas: 65,
        kmRecorridos: 210,
        empleoLocal: true,
        practicasRegenerativas: ['Agroforestería con cacao', 'Procesamiento mínimo para conservar antioxidantes', 'Técnicas ancestrales de nibs', 'Conservación de variedades criollas', 'Cooperativismo cacaotero puro']
      }
    },
    seoData: {
      metaTitle: 'Nibs Cacao Orgánico 100g | Tabasco Comacalco | Arca Tierra',
      metaDescription: 'Nibs de cacao orgánico puro de Cooperativa Cacao Tabasco en Comacalco. 42 años de experiencia, rico en antioxidantes.',
      keywords: ['nibs cacao orgánico', 'Roberto Chávez Maya', 'Comacalco', 'Tabasco', 'cacao puro', 'nibs antioxidantes']
    }
  },
  
  // ENDULZANTES NATURALES
  {
    id: 'azucar-pura-cana-organica-zulka-500g',
    nombre: 'Azúcar Pura de Caña Orgánica',
    precio: 32.00,
    unidad: '500g',
    imagen: 'https://drive.google.com/file/d/1CdE0fF1gG2hH3iI4jJ5kK6lL7mM8nN9o/view?usp=drive_link',
    productor: 'Ingenio Zulka Orgánico',
    ubicacion: 'Guamuchil, Sinaloa',
    categoria: 'endulzantes',
    rating: 4.6,
    reviews: 167,
    stock: 80,
    badges: ['USDA Orgánico', 'No-GMO Verificado', 'Puro'],
    descripcion: 'Azúcar pura de caña del Ingenio Zulka, certificado orgánico por USDA y verificado Non-GMO. Libre de elementos artificiales.',
    storytelling: 'La dulzura pura sin comprometer la salud, desde los campos de caña de Sinaloa donde la tradición azucarera se une con la pureza orgánica',
    metricas: {
      co2: '1.4 kg CO₂',
      agua: '32L agua',
      plastico: '18g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Ingenio Zulka Orgánico - Coordinador: Luis Fernando García',
        experiencia: '35 años en producción orgánica de azúcar de caña',
        especializacion: 'Azúcar orgánica certificada USDA y procesamiento puro',
        fotografia: 'https://drive.google.com/file/d/ejemplo-luis-garcia/view?usp=drive_link'
      },
      origen: {
        region: 'Valle de Guamuchil',
        estado: 'Sinaloa',
        municipio: 'Guamuchil',
        altitud: '25 msnm',
        clima: 'Tropical seco ideal para caña'
      },
      cultivo: {
        metodo: 'Agricultura Orgánica Certificada y Procesamiento Industrial Limpio',
        certificaciones: ['USDA Orgánico Certificado', 'No-GMO Verificado', 'Procesamiento Puro'],
        temporada: 'Noviembre - Mayo',
        tiempoCosecha: 'Procesado hace 3 semanas',
        tiempoTransporte: '< 48 horas'
      },
      impacto: {
        familiasBeneficiadas: 120,
        kmRecorridos: 185,
        empleoLocal: true,
        practicasRegenerativas: ['Cultivo orgánico de caña', 'Procesamiento sin químicos', 'Certificación USDA', 'Agricultura libre de GMO', 'Ingenio sustentable']
      }
    },
    seoData: {
      metaTitle: 'Azúcar Pura Caña Orgánica 500g | Zulka Sinaloa | Arca Tierra',
      metaDescription: 'Azúcar pura de caña orgánica del Ingenio Zulka en Guamuchil, Sinaloa. USDA orgánico, No-GMO verificado, 35 años de experiencia.',
      keywords: ['azúcar orgánica', 'Ingenio Zulka', 'Luis Fernando García', 'Guamuchil', 'Sinaloa', 'USDA orgánico']
    }
  },
  {
    id: 'miel-pura-chinampas-xochimilco-250g',
    nombre: 'Miel de las Chinampas',
    precio: 115.00,
    unidad: '250g',
    imagen: 'https://drive.google.com/file/d/1DeF1gG2hH3iI4jJ5kK6lL7mM8nN9oO0p/view?usp=drive_link',
    productor: 'Cooperativa Apicultores de Xochimilco',
    ubicacion: 'Xochimilco, CDMX',
    categoria: 'endulzantes',
    rating: 4.9,
    reviews: 134,
    stock: 25,
    badges: ['Miel Cruda', 'De Chinampas', 'Sagrada'],
    descripcion: 'Miel pura y cruda de abejas que polinizan las flores sagradas de las chinampas de Xochimilco. Sabor único y propiedades naturales ancestrales.',
    storytelling: 'El néctar sagrado de las chinampas, donde las abejas danzan entre flores ancestrales creando la miel más pura de la Ciudad de México',
    metricas: {
      co2: '1.1 kg CO₂',
      agua: '15L agua',
      plastico: '30g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cooperativa Apicultores de Xochimilco - Coordinador: Ismael Flores Cruz',
        experiencia: '28 años en apicultura de chinampas y miel cruda',
        especializacion: 'Miel cruda de chinampas y apicultura ancestral',
        fotografia: 'https://drive.google.com/file/d/ejemplo-ismael-flores/view?usp=drive_link'
      },
      origen: {
        region: 'Chinampas de Xochimilco',
        estado: 'Ciudad de México',
        municipio: 'Xochimilco',
        altitud: '2,240 msnm',
        clima: 'Templado húmedo lacustre de chinampa'
      },
      cultivo: {
        metodo: 'Apicultura Ancestral en Chinampas',
        certificaciones: ['Miel Cruda Certificada', 'Apicultura de Chinampas', 'Patrimonio Lacustre'],
        temporada: 'Marzo - Noviembre',
        tiempoCosecha: 'Extracción hace 2 semanas',
        tiempoTransporte: '< 24 horas'
      },
      impacto: {
        familiasBeneficiadas: 18,
        kmRecorridos: 35,
        empleoLocal: true,
        practicasRegenerativas: ['Polinización de chinampas', 'Conservación de abejas nativas', 'Miel sin procesamiento', 'Preservación del ecosistema lacustre', 'Apicultura ancestral chinampera']
      }
    },
    seoData: {
      metaTitle: 'Miel Pura Chinampas 250g | Xochimilco CDMX | Arca Tierra',
      metaDescription: 'Miel cruda pura de chinampas de Cooperativa Apicultores de Xochimilco en CDMX. 28 años de experiencia, apicultura ancestral.',
      keywords: ['miel chinampas', 'miel cruda', 'Ismael Flores Cruz', 'Xochimilco', 'miel sagrada', 'apicultura chinampera']
    }
  },
  {
    id: 'piloncillo-granulado-natural-veracruz-250g',
    nombre: 'Piloncillo Granulado Natural',
    precio: 38.00,
    unidad: '250g',
    imagen: 'https://drive.google.com/file/d/1EfG2hH3iI4jJ5kK6lL7mM8nN9oO0pP1q/view?usp=drive_link',
    productor: 'Cooperativa Ingenios Tradicionales de Veracruz',
    ubicacion: 'Córdoba, Veracruz',
    categoria: 'endulzantes',
    rating: 4.7,
    reviews: 89,
    stock: 60,
    badges: ['100% Natural', 'Sin Refinar', 'Tradicional'],
    descripcion: 'Piloncillo granulado natural sin refinar de la Cooperativa Ingenios Tradicionales de Veracruz. Conserva todos los minerales y sabor auténtico de la caña.',
    storytelling: 'La dulzura tradicional mexicana, desde los ingenios ancestrales de Veracruz donde el piloncillo guarda la esencia pura de la caña',
    metricas: {
      co2: '1.0 kg CO₂',
      agua: '20L agua',
      plastico: '12g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cooperativa Ingenios Tradicionales de Veracruz - Coordinador: Alfredo Mendoza Peña',
        experiencia: '45 años en producción tradicional de piloncillo y caña',
        especializacion: 'Piloncillo tradicional sin refinar y procesamiento ancestral',
        fotografia: 'https://drive.google.com/file/d/ejemplo-alfredo-mendoza/view?usp=drive_link'
      },
      origen: {
        region: 'Región de Córdoba',
        estado: 'Veracruz',
        municipio: 'Córdoba',
        altitud: '860 msnm',
        clima: 'Cálido húmedo ideal para caña'
      },
      cultivo: {
        metodo: 'Ingenio Tradicional y Procesamiento Ancestral',
        certificaciones: ['100% Natural', 'Sin Refinar', 'Procesamiento Tradicional'],
        temporada: 'Diciembre - Junio',
        tiempoCosecha: 'Procesado hace 2 semanas',
        tiempoTransporte: '< 48 horas'
      },
      impacto: {
        familiasBeneficiadas: 75,
        kmRecorridos: 155,
        empleoLocal: true,
        practicasRegenerativas: ['Procesamiento sin refinamiento', 'Conservación de minerales naturales', 'Técnicas de ingenio ancestral', 'Cooperativismo azucarero tradicional', 'Preservación de sabor auténtico']
      }
    },
    seoData: {
      metaTitle: 'Piloncillo Granulado Natural 250g | Córdoba Veracruz | Arca Tierra',
      metaDescription: 'Piloncillo granulado natural de Cooperativa Ingenios Tradicionales en Córdoba, Veracruz. 45 años de experiencia, sin refinar.',
      keywords: ['piloncillo natural', 'Alfredo Mendoza Peña', 'Córdoba', 'Veracruz', 'piloncillo sin refinar', 'ingenio tradicional']
    }
  },
  
  // ESPECIAS Y CONDIMENTOS ARTESANALES
  {
    id: 'canela-entera-agroecologica-morelos-50g',
    nombre: 'Canela Entera Agroecológica',
    precio: 78.00,
    unidad: '50g',
    imagen: 'https://drive.google.com/file/d/1FgH3iI4jJ5kK6lL7mM8nN9oO0pP1qQ2r/view?usp=drive_link',
    productor: 'Consorcio Morelense Santa Anita',
    ubicacion: 'Tepoztlán, Morelos',
    categoria: 'especias',
    rating: 4.8,
    reviews: 156,
    stock: 70,
    badges: ['Agroecológica', 'Secada al Sol', 'Artesanal'],
    descripcion: 'Canela entera agroecológica del Consorcio Morelense Santa Anita, secada al sol y seleccionada a mano. Aroma cálido, intenso y natural.',
    storytelling: 'Cultivada sin agroquímicos que cuidan la tierra y tu salud, desde las montañas sagradas de Morelos',
    metricas: {
      co2: '0.4 kg CO₂',
      agua: '12L agua',
      plastico: '5g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Consorcio Morelense Santa Anita - Coordinadora: Rosa María Salinas',
        experiencia: '32 años en cultivo agroecológico de canela y especias',
        especializacion: 'Canela agroecológica secada al sol y selección artesanal',
        fotografia: 'https://drive.google.com/file/d/ejemplo-rosa-salinas/view?usp=drive_link'
      },
      origen: {
        region: 'Sierra de Tepoztlán',
        estado: 'Morelos',
        municipio: 'Tepoztlán',
        altitud: '1,700 msnm',
        clima: 'Templado sub-húmedo de montaña'
      },
      cultivo: {
        metodo: 'Agricultura Agroecológica y Secado Solar',
        certificaciones: ['Agroecológica Certificada', 'Secado Natural', 'Selección Manual'],
        temporada: 'Todo el año',
        tiempoCosecha: 'Secada hace 1 mes',
        tiempoTransporte: '< 48 horas'
      },
      impacto: {
        familiasBeneficiadas: 28,
        kmRecorridos: 95,
        empleoLocal: true,
        practicasRegenerativas: ['Cultivo sin agroquímicos', 'Secado solar natural', 'Selección manual artesanal', 'Conservación de suelos de montaña', 'Consorcio agroecológico']
      }
    },
    seoData: {
      metaTitle: 'Canela Entera Agroecológica 50g | Tepoztlán Morelos | Arca Tierra',
      metaDescription: 'Canela entera agroecológica del Consorcio Morelense Santa Anita en Tepoztlán, Morelos. 32 años de experiencia, secada al sol.',
      keywords: ['canela agroecológica', 'Rosa María Salinas', 'Tepoztlán', 'Morelos', 'canela secada sol', 'consorcio morelense']
    }
  },
  {
    id: 'cardamomo-chiapas-comercio-justo-20g',
    nombre: 'Cardamomo de Chiapas',
    precio: 95.00,
    unidad: '20g',
    imagen: 'https://drive.google.com/file/d/1GhI4jJ5kK6lL7mM8nN9oO0pP1qQ2rR3s/view?usp=drive_link',
    productor: 'Cooperativa Productores Chiapanecos de Especias',
    ubicacion: 'Tapachula, Chiapas',
    categoria: 'especias',
    rating: 4.9,
    reviews: 89,
    stock: 35,
    badges: ['Comercio Justo', 'Aroma Intenso', 'Maya'],
    descripcion: 'Cardamomo de Chiapas de la Cooperativa Productores Chiapanecos, cultivado bajo prácticas agroecológicas de comercio justo. Aroma intenso y especiado, ideal para chai.',
    storytelling: 'Fomenta el comercio justo con familias productoras mayas, desde las montañas de Chiapas donde cada vaina guarda el aroma ancestral',
    metricas: {
      co2: '0.3 kg CO₂',
      agua: '8L agua',
      plastico: '3g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cooperativa Productores Chiapanecos de Especias - Coordinador: Antonio López Morales',
        experiencia: '26 años en cultivo agroecológico de cardamomo y especias tropicales',
        especializacion: 'Cardamomo de comercio justo y especias de alta montaña',
        fotografia: 'https://drive.google.com/file/d/ejemplo-antonio-lopez/view?usp=drive_link'
      },
      origen: {
        region: 'Sierra Madre de Chiapas',
        estado: 'Chiapas',
        municipio: 'Tapachula',
        altitud: '1,200 msnm',
        clima: 'Tropical de alta montaña ideal para cardamomo'
      },
      cultivo: {
        metodo: 'Agricultura Agroecológica de Comercio Justo',
        certificaciones: ['Comercio Justo Certificado', 'Agroecológico', 'Aroma Intenso Verificado'],
        temporada: 'Octubre - Febrero',
        tiempoCosecha: 'Cosechado hace 3 semanas',
        tiempoTransporte: '< 72 horas'
      },
      impacto: {
        familiasBeneficiadas: 22,
        kmRecorridos: 285,
        empleoLocal: true,
        practicasRegenerativas: ['Comercio justo certificado', 'Cultivo bajo sombra tropical', 'Preservación de variedades nativas', 'Cooperativismo indígena maya', 'Agroforestería de montaña']
      }
    },
    seoData: {
      metaTitle: 'Cardamomo Chiapas Comercio Justo 20g | Tapachula | Arca Tierra',
      metaDescription: 'Cardamomo de comercio justo de Cooperativa Productores Chiapanecos en Tapachula, Chiapas. 26 años de experiencia, aroma intenso.',
      keywords: ['cardamomo chiapas', 'comercio justo', 'Antonio López Morales', 'Tapachula', 'cardamomo maya', 'especias chiapanecos']
    }
  },
  {
    id: 'curcuma-organica-polvo-oaxaca-55g',
    nombre: 'Cúrcuma Orgánica en Polvo',
    precio: 105.00,
    unidad: '55g',
    imagen: 'https://drive.google.com/file/d/1HiJ5kK6lL7mM8nN9oO0pP1qQ2rR3sS4t/view?usp=drive_link',
    productor: 'Cooperativa Especias del Sur de Oaxaca',
    ubicacion: 'Juchitán, Oaxaca',
    categoria: 'especias',
    rating: 4.7,
    reviews: 134,
    stock: 45,
    badges: ['Orgánica Certificada', 'Antiinflamatoria', 'Medicinal'],
    descripcion: 'Cúrcuma orgánica en polvo de la Cooperativa Especias del Sur de Oaxaca, con propiedades antiinflamatorias naturales. Color dorado vibrante.',
    storytelling: 'El oro dorado de la medicina ancestral, desde las tierras sagradas de Oaxaca donde cada raíz guarda el poder curativo milenario',
    metricas: {
      co2: '0.5 kg CO₂',
      agua: '15L agua',
      plastico: '6g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cooperativa Especias del Sur de Oaxaca - Coordinadora: Soledad Martínez Santiago',
        experiencia: '24 años en cultivo orgánico de cúrcuma y plantas medicinales',
        especializacion: 'Cúrcuma orgánica medicinal y procesamiento en polvo',
        fotografia: 'https://drive.google.com/file/d/ejemplo-soledad-martinez/view?usp=drive_link'
      },
      origen: {
        region: 'Istmo de Tehuantepec',
        estado: 'Oaxaca',
        municipio: 'Juchitán',
        altitud: '50 msnm',
        clima: 'Cálido seco ideal para cúrcuma'
      },
      cultivo: {
        metodo: 'Agricultura Orgánica Medicinal',
        certificaciones: ['Orgánica Certificada', 'Planta Medicinal', 'Procesamiento Artesanal'],
        temporada: 'Diciembre - Abril',
        tiempoCosecha: 'Procesado hace 2 semanas',
        tiempoTransporte: '< 72 horas'
      },
      impacto: {
        familiasBeneficiadas: 35,
        kmRecorridos: 205,
        empleoLocal: true,
        practicasRegenerativas: ['Cultivo orgánico de plantas medicinales', 'Procesamiento artesanal en polvo', 'Conservación de propiedades antiinflamatorias', 'Medicina tradicional oaxaqueña', 'Cooperativismo de especias del sur']
      }
    },
    seoData: {
      metaTitle: 'Cúrcuma Orgánica Polvo 55g | Juchitán Oaxaca | Arca Tierra',
      metaDescription: 'Cúrcuma orgánica en polvo de Cooperativa Especias del Sur en Juchitán, Oaxaca. 24 años de experiencia, propiedades antiinflamatorias.',
      keywords: ['cúrcuma orgánica', 'Soledad Martínez Santiago', 'Juchitán', 'Oaxaca', 'cúrcuma medicinal', 'especias del sur']
    }
  },
  {
    id: 'oregano-mexicano-autentico-queretaro-50g',
    nombre: 'Orégano Mexicano',
    precio: 42.00,
    unidad: '50g',
    imagen: 'https://drive.google.com/file/d/1IjK6lL7mM8nN9oO0pP1qQ2rR3sS4tT5u/view?usp=drive_link',
    productor: 'Cooperativa Hierbas del Campo Queretano',
    ubicacion: 'Ezequiel Montes, Querétaro',
    categoria: 'especias',
    rating: 4.8,
    reviews: 198,
    stock: 85,
    badges: ['100% Mexicano', 'Sabor Intenso', 'Auténtico'],
    descripcion: 'Orégano mexicano auténtico de la Cooperativa Hierbas del Campo Queretano, con sabor más intenso que el europeo. Perfecto para la cocina tradicional.',
    storytelling: 'El verdadero sabor de México en cada hoja, desde los campos semiáridos de Querétaro donde el orégano crece con la intensidad del sol mexicano',
    metricas: {
      co2: '0.2 kg CO₂',
      agua: '8L agua',
      plastico: '4g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cooperativa Hierbas del Campo Queretano - Coordinador: Raúl González Herrera',
        experiencia: '29 años en cultivo tradicional de orégano mexicano y hierbas de temporal',
        especializacion: 'Orégano mexicano auténtico y hierbas aromáticas tradicionales',
        fotografia: 'https://drive.google.com/file/d/ejemplo-raul-gonzalez/view?usp=drive_link'
      },
      origen: {
        region: 'Semiárido Queretano',
        estado: 'Querétaro',
        municipio: 'Ezequiel Montes',
        altitud: '2,040 msnm',
        clima: 'Semiárido templado ideal para orégano'
      },
      cultivo: {
        metodo: 'Cultivo Tradicional de Temporal',
        certificaciones: ['100% Mexicano Verificado', 'Cultivo de Temporal', 'Sabor Intenso Tradicional'],
        temporada: 'Junio - Octubre',
        tiempoCosecha: 'Secado hace 1 mes',
        tiempoTransporte: '< 48 horas'
      },
      impacto: {
        familiasBeneficiadas: 32,
        kmRecorridos: 135,
        empleoLocal: true,
        practicasRegenerativas: ['Cultivo de temporal sin riego', 'Secado solar tradicional', 'Conservación de variedades mexicanas', 'Adaptación al clima semiárido', 'Cooperativismo herbolario queretano']
      }
    },
    seoData: {
      metaTitle: 'Orégano Mexicano Auténtico 50g | Querétaro | Arca Tierra',
      metaDescription: 'Orégano mexicano auténtico de Cooperativa Hierbas del Campo en Ezequiel Montes, Querétaro. 29 años de experiencia, sabor intenso.',
      keywords: ['orégano mexicano', 'Raúl González Herrera', 'Ezequiel Montes', 'Querétaro', 'orégano auténtico', 'hierbas del campo']
    }
  },
  {
    id: 'jengibre-deshidratado-natural-veracruz-50g',
    nombre: 'Jengibre Deshidratado',
    precio: 58.00,
    unidad: '50g',
    imagen: 'https://drive.google.com/file/d/1JkL7mM8nN9oO0pP1qQ2rR3sS4tT5uU6v/view?usp=drive_link',
    productor: 'Cooperativa Especias del Trópico Veracruzano',
    ubicacion: 'Papantla, Veracruz',
    categoria: 'especias',
    rating: 4.6,
    reviews: 112,
    stock: 55,
    badges: ['Deshidratado Natural', 'Digestivo', 'Tropical'],
    descripcion: 'Jengibre deshidratado naturalmente de la Cooperativa Especias del Trópico Veracruzano. Conserva todas sus propiedades digestivas y sabor picante.',
    storytelling: 'El calor tropical para tu bienestar, desde las tierras húmedas de Veracruz donde el jengibre crece con la fuerza del trópico',
    metricas: {
      co2: '0.4 kg CO₂',
      agua: '10L agua',
      plastico: '5g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cooperativa Especias del Trópico Veracruzano - Coordinadora: Elena Morales Vázquez',
        experiencia: '22 años en cultivo tropical de jengibre y deshidratado natural',
        especializacion: 'Jengibre tropical y deshidratado solar preservando propiedades digestivas',
        fotografia: 'https://drive.google.com/file/d/ejemplo-elena-morales/view?usp=drive_link'
      },
      origen: {
        region: 'Trópico de Papantla',
        estado: 'Veracruz',
        municipio: 'Papantla',
        altitud: '180 msnm',
        clima: 'Tropical húmedo ideal para jengibre'
      },
      cultivo: {
        metodo: 'Agricultura Tropical y Deshidratado Solar Natural',
        certificaciones: ['Deshidratado Natural', 'Propiedades Digestivas Preservadas', 'Procesamiento Solar'],
        temporada: 'Noviembre - Marzo',
        tiempoCosecha: 'Deshidratado hace 3 semanas',
        tiempoTransporte: '< 72 horas'
      },
      impacto: {
        familiasBeneficiadas: 28,
        kmRecorridos: 165,
        empleoLocal: true,
        practicasRegenerativas: ['Cultivo tropical sostenible', 'Deshidratado solar sin químicos', 'Preservación de propiedades medicinales', 'Procesamiento artesanal', 'Cooperativismo tropical veracruzano']
      }
    },
    seoData: {
      metaTitle: 'Jengibre Deshidratado Natural 50g | Papantla Veracruz | Arca Tierra',
      metaDescription: 'Jengibre deshidratado natural de Cooperativa Especias del Trópico en Papantla, Veracruz. 22 años de experiencia, propiedades digestivas.',
      keywords: ['jengibre deshidratado', 'Elena Morales Vázquez', 'Papantla', 'Veracruz', 'jengibre digestivo', 'especias trópico']
    }
  },
  {
    id: 'pimienta-negra-molida-premium-tabasco-50g',
    nombre: 'Pimienta Negra Molida',
    precio: 110.00,
    unidad: '50g',
    imagen: 'https://drive.google.com/file/d/1KlM8nN9oO0pP1qQ2rR3sS4tT5uU6vV7w/view?usp=drive_link',
    productor: 'Cooperativa Especias Premium de Tabasco',
    ubicacion: 'Comalcalco, Tabasco',
    categoria: 'especias',
    rating: 4.9,
    reviews: 187,
    stock: 40,
    badges: ['Recién Molida', 'Aroma Intenso', 'Premium'],
    descripcion: 'Pimienta negra recién molida de la Cooperativa Especias Premium de Tabasco, con aroma y sabor intensos. La reina de las especias.',
    storytelling: 'La intensidad y aroma en cada granito, desde las tierras húmedas de Tabasco donde la pimienta alcanza su máxima potencia',
    metricas: {
      co2: '0.6 kg CO₂',
      agua: '18L agua',
      plastico: '6g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Cooperativa Especias Premium de Tabasco - Coordinador: Jorge Alejandro Ruiz',
        experiencia: '33 años en cultivo tropical de pimienta negra y especias premium',
        especializacion: 'Pimienta negra premium y molido artesanal fresco',
        fotografia: 'https://drive.google.com/file/d/ejemplo-jorge-ruiz/view?usp=drive_link'
      },
      origen: {
        region: 'Chontalpa Tabasqueña',
        estado: 'Tabasco',
        municipio: 'Comalcalco',
        altitud: '5 msnm',
        clima: 'Tropical húmedo ideal para pimienta'
      },
      cultivo: {
        metodo: 'Agricultura Tropical Premium y Molido Fresco',
        certificaciones: ['Molido Recién', 'Aroma Intenso Premium', 'Calidad Gourmet'],
        temporada: 'Todo el año',
        tiempoCosecha: 'Molido hace 1 semana',
        tiempoTransporte: '< 48 horas'
      },
      impacto: {
        familiasBeneficiadas: 18,
        kmRecorridos: 225,
        empleoLocal: true,
        practicasRegenerativas: ['Cultivo bajo sombra tropical', 'Molido artesanal fresco', 'Preservación de aroma natural', 'Procesamiento premium', 'Cooperativismo especiero tabasqueño']
      }
    },
    seoData: {
      metaTitle: 'Pimienta Negra Molida Premium 50g | Comalcalco Tabasco | Arca Tierra',
      metaDescription: 'Pimienta negra molida premium de Cooperativa Especias Premium en Comalcalco, Tabasco. 33 años de experiencia, aroma intenso.',
      keywords: ['pimienta negra molida', 'Jorge Alejandro Ruiz', 'Comalcalco', 'Tabasco', 'pimienta premium', 'especias premium tabasco']
    }
  },
  
  // PROTEÍNAS REGENERATIVAS
  {
    id: 'arrachera-res-origen-regenerativo-jalisco-500g',
    nombre: 'Arrachera de Res de Origen Regenerativo',
    precio: 320.00,
    unidad: '500g',
    imagen: 'https://drive.google.com/file/d/1LmN9oO0pP1qQ2rR3sS4tT5uU6vV7wW8x/view?usp=drive_link',
    productor: 'Rancho Santa Pradera Regenerativo',
    ubicacion: 'Capilla de Guadalupe, Jalisco',
    categoria: 'proteinas',
    rating: 4.9,
    reviews: 145,
    stock: 20,
    badges: ['Origen Regenerativo', 'Libre Pastoreo', 'Captura CO2'],
    descripcion: 'Arrachera de res de origen regenerativo del Rancho Santa Pradera, ideal para asar. Criada en libre pastoreo sin hormonas ni antibióticos.',
    storytelling: 'La ganadería que regenera la tierra, donde cada animal pasta en armonía con la naturaleza capturando carbono del suelo',
    metricas: {
      co2: '8.5 kg CO₂ capturado',
      agua: '125L agua',
      plastico: '45g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Rancho Santa Pradera Regenerativo - Coordinador: Raúl Santamaría González',
        experiencia: '27 años en ganadería regenerativa y pastoreo rotacional',
        especializacion: 'Ganadería regenerativa con captura de carbono y libre pastoreo',
        fotografia: 'https://drive.google.com/file/d/ejemplo-raul-santamaria/view?usp=drive_link'
      },
      origen: {
        region: 'Altos de Jalisco',
        estado: 'Jalisco',
        municipio: 'Capilla de Guadalupe',
        altitud: '2,050 msnm',
        clima: 'Templado seco ideal para pastoreo'
      },
      cultivo: {
        metodo: 'Ganadería Regenerativa con Pastoreo Rotacional',
        certificaciones: ['Origen Regenerativo', 'Libre Pastoreo', 'Captura de Carbono'],
        temporada: 'Todo el año',
        tiempoCosecha: 'Procesado hace 1 semana',
        tiempoTransporte: '< 24 horas'
      },
      impacto: {
        familiasBeneficiadas: 12,
        kmRecorridos: 85,
        empleoLocal: true,
        practicasRegenerativas: ['Pastoreo rotacional regenerativo', 'Captura de carbono en suelo', 'Libre pastoreo sin confinamiento', 'Ganadería sin hormonas ni antibióticos', 'Restauración de praderas nativas']
      }
    },
    seoData: {
      metaTitle: 'Arrachera Res Origen Regenerativo 500g | Jalisco | Arca Tierra',
      metaDescription: 'Arrachera de res regenerativa del Rancho Santa Pradera en Capilla de Guadalupe, Jalisco. 27 años de experiencia, captura CO2.',
      keywords: ['arrachera regenerativa', 'Raúl Santamaría González', 'Capilla Guadalupe', 'Jalisco', 'ganadería regenerativa', 'libre pastoreo']
    }
  },
  {
    id: 'bistec-res-origen-regenerativo-rancho555-veracruz-500g',
    nombre: 'Bistec de Res de Origen Regenerativo',
    precio: 215.00,
    unidad: '500g',
    imagen: 'https://drive.google.com/file/d/1MnO0pP1qQ2rR3sS4tT5uU6vV7wW8xX9y/view?usp=drive_link',
    productor: 'Rancho 555 Regenerativo Veracruzano',
    ubicacion: 'Álamo Temapache, Veracruz',
    categoria: 'proteinas',
    rating: 4.8,
    reviews: 178,
    stock: 25,
    badges: ['Regenerativo Certificado', '15 Años Experiencia', 'Captura CO2'],
    descripcion: 'Bistec de res del Rancho 555 Regenerativo Veracruzano, expertos en ganadería regenerativa con más de 15 años regenerando suelos.',
    storytelling: 'Más de 15 años regenerando ecosistemas en las praderas tropicales de Veracruz, donde cada animal contribuye a la captura de carbono',
    metricas: {
      co2: '7.2 kg CO₂ capturado',
      agua: '110L agua',
      plastico: '40g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Rancho 555 Regenerativo Veracruzano - Coordinador: Carlos Alberto Martínez',
        experiencia: '15 años en ganadería regenerativa tropical y restauración de pastizales',
        especializacion: 'Ganadería regenerativa tropical con enfoque en captura de carbono',
        fotografia: 'https://drive.google.com/file/d/ejemplo-carlos-martinez/view?usp=drive_link'
      },
      origen: {
        region: 'Huasteca Veracruzana',
        estado: 'Veracruz',
        municipio: 'Álamo Temapache',
        altitud: '45 msnm',
        clima: 'Tropical húmedo ideal para pastoreo'
      },
      cultivo: {
        metodo: 'Ganadería Regenerativa Tropical con Rotación de Pastizales',
        certificaciones: ['Regenerativo Certificado', 'Captura de Carbono', '15 Años Experiencia'],
        temporada: 'Todo el año',
        tiempoCosecha: 'Procesado hace 1 semana',
        tiempoTransporte: '< 36 horas'
      },
      impacto: {
        familiasBeneficiadas: 8,
        kmRecorridos: 195,
        empleoLocal: true,
        practicasRegenerativas: ['Rotación de pastizales tropicales', '15 años de captura de carbono', 'Restauración de praderas nativas', 'Ganadería sin confinamiento', 'Regeneración de suelos tropicales']
      }
    },
    seoData: {
      metaTitle: 'Bistec Res Origen Regenerativo 500g | Rancho 555 Veracruz | Arca Tierra',
      metaDescription: 'Bistec de res regenerativa del Rancho 555 en Álamo Temapache, Veracruz. 15 años de experiencia, captura CO2.',
      keywords: ['bistec regenerativo', 'Carlos Alberto Martínez', 'Álamo Temapache', 'Veracruz', 'rancho 555', 'ganadería regenerativa']
    }
  },
  {
    id: 'huevo-organico-libre-pastoreo-chinampas-xochimilco-pieza',
    nombre: 'Huevo Orgánico de Libre Pastoreo',
    precio: 9.50,
    unidad: 'pieza',
    imagen: 'https://drive.google.com/file/d/1NoP1qQ2rR3sS4tT5uU6vV7wW8xX9yY0z/view?usp=drive_link',
    productor: 'Granja Chinampas Orgánicas Xochimilco',
    ubicacion: 'Xochimilco, Ciudad de México',
    categoria: 'proteinas',
    rating: 5.0,
    reviews: 234,
    stock: 120,
    badges: ['Libre Pastoreo', 'Gallinas Felices', 'Chinampas'],
    descripcion: 'Huevos de gallinas de libre pastoreo de la Granja Chinampas Orgánicas en Xochimilco. Yemas naranjas vibrantes y sabor excepcional.',
    storytelling: 'De gallinas felices que viven libres en las chinampas ancestrales de Xochimilco, donde la tradición prehispánica se encuentra con la agricultura moderna',
    metricas: {
      co2: '0.8 kg CO₂ capturado',
      agua: '15L agua',
      plastico: '2g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Granja Chinampas Orgánicas Xochimilco - Coordinadora: Patricia Flores Mendoza',
        experiencia: '18 años en avicultura orgánica de libre pastoreo en chinampas',
        especializacion: 'Gallinas de libre pastoreo en sistema tradicional de chinampas',
        fotografia: 'https://drive.google.com/file/d/ejemplo-patricia-flores/view?usp=drive_link'
      },
      origen: {
        region: 'Chinampas de Xochimilco',
        estado: 'Ciudad de México',
        municipio: 'Xochimilco',
        altitud: '2,240 msnm',
        clima: 'Templado húmedo lacustre ideal para avicultura'
      },
      cultivo: {
        metodo: 'Avicultura Orgánica de Libre Pastoreo en Chinampas',
        certificaciones: ['Libre Pastoreo Certificado', 'Gallinas Felices', 'Sistema Chinampas'],
        temporada: 'Todo el año',
        tiempoCosecha: 'Recolectado hace 2 días',
        tiempoTransporte: '< 12 horas'
      },
      impacto: {
        familiasBeneficiadas: 6,
        kmRecorridos: 25,
        empleoLocal: true,
        practicasRegenerativas: ['Libre pastoreo en chinampas', 'Conservación de tradición prehispánica', 'Gallinas felices sin confinamiento', 'Alimentación orgánica natural', 'Protección del ecosistema lacustre']
      }
    },
    seoData: {
      metaTitle: 'Huevo Orgánico Libre Pastoreo | Chinampas Xochimilco | Arca Tierra',
      metaDescription: 'Huevos orgánicos de libre pastoreo de Granja Chinampas en Xochimilco, CDMX. 18 años de experiencia, gallinas felices.',
      keywords: ['huevo orgánico', 'Patricia Flores Mendoza', 'Xochimilco', 'chinampas', 'libre pastoreo', 'gallinas felices']
    }
  },
  {
    id: 'milanesa-pollo-regenerativo-granja-paraiso-amanalco-500g',
    nombre: 'Milanesa de Pollo Regenerativo',
    precio: 235.00,
    unidad: '500g',
    imagen: 'https://drive.google.com/file/d/1OpP1qQ2rR3sS4tT5uU6vV7wW8xX9yY0zA/view?usp=drive_link',
    productor: 'Granja Paraíso Gourmet Regenerativa',
    ubicacion: 'Amanalco de Becerra, Estado de México',
    categoria: 'proteinas',
    rating: 4.7,
    reviews: 123,
    stock: 30,
    badges: ['Pollo Regenerativo', 'Listas para Cocinar', 'Gourmet'],
    descripcion: 'Milanesas de pollo regenerativo de la Granja Paraíso Gourmet Regenerativa. Criado de manera sostenible en Amanalco.',
    storytelling: 'El sabor único y saludable de pollo regenerativo, desde las montañas de Amanalco donde los pollos crecen libres en armonía con el bosque',
    metricas: {
      co2: '4.5 kg CO₂ capturado',
      agua: '85L agua',
      plastico: '35g plástico evitado'
    },
    trazabilidad: {
      agricultor: {
        nombre: 'Granja Paraíso Gourmet Regenerativa - Coordinador: Miguel Ángel Rodríguez',
        experiencia: '21 años en avicultura regenerativa de montaña y procesamiento gourmet',
        especializacion: 'Pollos regenerativos de libre pastoreo en ecosistemas de montaña',
        fotografia: 'https://drive.google.com/file/d/ejemplo-miguel-rodriguez/view?usp=drive_link'
      },
      origen: {
        region: 'Montañas del Estado de México',
        estado: 'Estado de México',
        municipio: 'Amanalco de Becerra',
        altitud: '2,650 msnm',
        clima: 'Templado de montaña ideal para avicultura'
      },
      cultivo: {
        metodo: 'Avicultura Regenerativa de Montaña con Libre Pastoreo',
        certificaciones: ['Pollo Regenerativo', 'Libre Pastoreo de Montaña', 'Procesamiento Gourmet'],
        temporada: 'Todo el año',
        tiempoCosecha: 'Procesado hace 3 días',
        tiempoTransporte: '< 18 horas'
      },
      impacto: {
        familiasBeneficiadas: 9,
        kmRecorridos: 75,
        empleoLocal: true,
        practicasRegenerativas: ['Libre pastoreo en bosques de montaña', 'Avicultura regenerativa sostenible', 'Pollos alimentados con granos locales', 'Procesamiento artesanal gourmet', 'Conservación del ecosistema montañoso']
      }
    },
    seoData: {
      metaTitle: 'Milanesa Pollo Regenerativo 500g | Amanalco Estado México | Arca Tierra',
      metaDescription: 'Milanesas de pollo regenerativo de Granja Paraíso Gourmet en Amanalco, Estado de México. 21 años de experiencia, libre pastoreo.',
      keywords: ['milanesa pollo regenerativo', 'Miguel Ángel Rodríguez', 'Amanalco Becerra', 'Estado México', 'pollo gourmet', 'avicultura regenerativa']
    }
  },
  
  // LÁCTEOS ARTESANALES
  {
    id: 'queso-manchego-chinampas-250g',
    nombre: 'Queso Manchego Artesanal de Chinampas',
    precio: 89.00,
    unidad: '250g',
    imagen: '/products/queso-manchego-250g.jpg',
    productor: 'Don Tomás Flores',
    ubicacion: 'Xochimilco, CDMX',
    categoria: 'lacteos',
    rating: 4.9,
    reviews: 156,
    stock: 35,
    badges: ['Artesanal', 'Vacas en Pastoreo'],
    descripcion: 'Queso manchego artesanal elaborado en Xochimilco. Proviene de vacas en pastoreo, ordeñadas por don Tomás Flores.',
    storytelling: 'Tradición quesera en el corazón de las chinampas',
    metricas: {
      co2: '3.2 kg CO₂',
      agua: '65L agua',
      plastico: '25g plástico evitado'
    }
  },
  {
    id: 'queso-oaxaca-chinampas-500g',
    nombre: 'Queso Oaxaca Artesanal de Chinampas',
    precio: 107.00,
    unidad: '500g',
    imagen: '/products/queso-oaxaca-500g.jpg',
    productor: 'Don Tomás Flores',
    ubicacion: 'Xochimilco, CDMX',
    categoria: 'lacteos',
    rating: 4.8,
    reviews: 189,
    stock: 40,
    badges: ['Artesanal', 'Ideal Quesadillas'],
    descripcion: 'Queso Oaxaca artesanal de Xochimilco. Perfecto para quesadillas y snacks, con la cremosidad tradicional.',
    storytelling: 'El sabor auténtico de Oaxaca en las chinampas',
    metricas: {
      co2: '4.1 kg CO₂',
      agua: '85L agua',
      plastico: '30g plástico evitado'
    }
  },
  {
    id: 'leche-entera-vaca-1l',
    nombre: 'Leche Entera de Vaca de Libre Pastoreo',
    precio: 65.00,
    unidad: '1L',
    imagen: '/products/leche-entera.jpg',
    productor: 'Rancho Lechero Los Pinos',
    ubicacion: 'Querétaro, México',
    categoria: 'lacteos',
    rating: 4.7,
    reviews: 145,
    stock: 50,
    badges: ['Libre Pastoreo', 'Mayor Omega-3'],
    descripcion: 'Leche de vacas de libre pastoreo, con mayor cantidad de omega-3 y vitamina E que la leche convencional.',
    storytelling: 'Pureza y nutrición directo del pastoreo libre',
    metricas: {
      co2: '5.2 kg CO₂',
      agua: '95L agua',
      plastico: '45g plástico evitado'
    }
  },
  {
    id: 'yogurt-griego-vaca-480g',
    nombre: 'Yogur Griego de Leche Orgánica',
    precio: 90.00,
    unidad: '480g',
    imagen: '/products/yogurt-griego.jpg',
    productor: 'Lácteos Orgánicos del Valle',
    ubicacion: 'Jalisco, México',
    categoria: 'lacteos',
    rating: 4.8,
    reviews: 203,
    stock: 30,
    badges: ['Orgánico', 'Cremoso y Espeso'],
    descripcion: 'Yogur griego orgánico cremoso y espeso. Ideal para desayunos, aderezos, salsas y platillos favoritos.',
    storytelling: 'Cremosidad griega con leche orgánica mexicana',
    metricas: {
      co2: '3.8 kg CO₂',
      agua: '75L agua',
      plastico: '40g plástico evitado'
    }
  },
  
  // HARINAS Y PAN
  {
    id: 'harina-trigo-integral-500g',
    nombre: 'Harina de Trigo Integral',
    precio: 44.00,
    unidad: '500g',
    imagen: '/products/harina-trigo-integral.jpg',
    productor: 'Molinos Integrales',
    ubicacion: 'Sonora, México',
    categoria: 'harinas',
    rating: 4.6,
    reviews: 134,
    stock: 60,
    badges: ['100% Integral', 'Rico en Fibra'],
    descripcion: 'Harina de trigo integral conserva todo el grano. Rica en fibra, vitaminas y minerales naturales.',
    storytelling: 'Nutrición completa del grano entero',
    metricas: {
      co2: '1.8 kg CO₂',
      agua: '45L agua',
      plastico: '15g plástico evitado'
    }
  },
  {
    id: 'harina-sorgo-integral-500g',
    nombre: 'Harina Integral de Sorgo',
    precio: 27.00,
    unidad: '500g',
    imagen: '/products/harina-sorgo.jpg',
    productor: 'Granos Ancestrales',
    ubicacion: 'Guanajuato, México',
    categoria: 'harinas',
    rating: 4.5,
    reviews: 89,
    stock: 45,
    badges: ['Sin Gluten', 'Grano Ancestral'],
    descripcion: 'Harina integral de sorgo, libre de gluten. Ideal para personas celíacas y dietas especiales.',
    storytelling: 'Grano ancestral para la alimentación moderna',
    metricas: {
      co2: '1.2 kg CO₂',
      agua: '28L agua',
      plastico: '12g plástico evitado'
    }
  },
  {
    id: 'hogaza-campesina-artesanal',
    nombre: 'Hogaza Campesina Artesanal',
    precio: 130.00,
    unidad: 'pieza',
    imagen: '/products/hogaza-campesina.jpg',
    productor: 'Panadera Artesanal La Espiga',
    ubicacion: 'Puebla, México',
    categoria: 'pan',
    rating: 4.9,
    reviews: 167,
    stock: 15,
    badges: ['Masa Madre', 'Sin Conservadores'],
    descripcion: 'Hogaza artesanal elaborada con masa madre y harinas limpias. Sin conservadores ni aditivos artificiales.',
    storytelling: 'El pan de siempre, hecho como debe ser',
    metricas: {
      co2: '2.5 kg CO₂',
      agua: '55L agua',
      plastico: '0g plástico evitado'
    }
  },
  
  // INFUSIONES Y TÉS
  {
    id: 'flor-jamaica-500g',
    nombre: 'Flor de Jamaica Natural',
    precio: 45.00,
    unidad: '500g',
    imagen: '/products/flor-jamaica.jpg',
    productor: 'Productores de Hidalgo',
    ubicacion: 'Hidalgo, México',
    categoria: 'infusiones',
    rating: 4.7,
    reviews: 178,
    stock: 70,
    badges: ['Rico en Antioxidantes', '100% Natural'],
    descripcion: 'Flor de Jamaica natural, rica en antioxidantes. Perfecta para agua fresca o té caliente.',
    storytelling: 'El color y sabor tradicional de México',
    metricas: {
      co2: '1.5 kg CO₂',
      agua: '35L agua',
      plastico: '20g plástico evitado'
    }
  },
  {
    id: 'melisa-organica-50g',
    nombre: 'Melisa Orgánica para Té',
    precio: 142.00,
    unidad: '50g',
    imagen: '/products/melisa-te.jpg',
    productor: 'Herbolaria Natural',
    ubicacion: 'Estado de México',
    categoria: 'infusiones',
    rating: 4.8,
    reviews: 123,
    stock: 35,
    badges: ['Orgánica', 'Propiedades Relajantes'],
    descripcion: 'Melisa orgánica con propiedades relajantes y digestivas. Ideal para té vespertino.',
    storytelling: 'Relajación natural en cada taza',
    metricas: {
      co2: '0.8 kg CO₂',
      agua: '18L agua',
      plastico: '8g plástico evitado'
    }
  },
  {
    id: 'zacate-limon-deshidratado-50g',
    nombre: 'Zacate Limón Deshidratado para Té',
    precio: 72.00,
    unidad: '50g',
    imagen: '/products/zacate-limon.jpg',
    productor: 'Hierbas Medicinales del Sur',
    ubicacion: 'Chiapas, México',
    categoria: 'infusiones',
    rating: 4.6,
    reviews: 98,
    stock: 40,
    badges: ['Deshidratado Natural', 'Aroma Cítrico'],
    descripcion: 'Zacate limón deshidratado con propiedades digestivas y aroma cítrico refrescante.',
    storytelling: 'Frescura herbal de las montañas de Chiapas',
    metricas: {
      co2: '0.6 kg CO₂',
      agua: '15L agua',
      plastico: '6g plástico evitado'
    }
  },
  
  // MERMELADAS Y UNTABLES NATURALES
  {
    id: 'mermelada-naranja-300g',
    nombre: 'Mermelada de Naranja Natural',
    precio: 104.00,
    unidad: '300g',
    imagen: '/products/mermelada-naranja.jpg',
    productor: 'Conservas Artesanales El Huerto',
    ubicacion: 'Puebla, México',
    categoria: 'mermeladas',
    rating: 4.8,
    reviews: 145,
    stock: 35,
    badges: ['Sin Conservadores', 'Fruta Real'],
    descripcion: 'Mermelada de naranja elaborada con fruta real, sin conservadores ni sabores artificiales.',
    storytelling: 'El sabor auténtico de la fruta en cada cucharada',
    metricas: {
      co2: '1.8 kg CO₂',
      agua: '35L agua',
      plastico: '25g plástico evitado'
    }
  },
  {
    id: 'mantequilla-cacahuate-crunchy-272ml',
    nombre: 'Mantequilla de Cacahuate Crunchy',
    precio: 121.00,
    unidad: '272ml',
    imagen: '/products/mantequilla-cacahuate-crunchy.jpg',
    productor: 'Frutos Secos La Nogalera',
    ubicacion: 'Sinaloa, México',
    categoria: 'mermeladas',
    rating: 4.9,
    reviews: 198,
    stock: 45,
    badges: ['100% Natural', 'Textura Crujiente'],
    descripcion: 'Mantequilla de cacahuate 100% natural con trozos crujientes. Sin azúcares añadidos ni conservadores.',
    storytelling: 'Textura y sabor que aman niños y adultos',
    metricas: {
      co2: '2.1 kg CO₂',
      agua: '45L agua',
      plastico: '30g plástico evitado'
    }
  },
  {
    id: 'sal-chautengo-500g',
    nombre: 'Sal de Chautengo',
    precio: 18.50,
    unidad: '500g',
    imagen: '/products/sal-chautengo.jpg',
    productor: 'Salineras Tradicionales',
    ubicacion: 'Guerrero, México',
    categoria: 'condimentos',
    rating: 4.6,
    reviews: 234,
    stock: 85,
    badges: ['Sal Marina', 'Tradición Artesanal'],
    descripcion: 'Sal marina de Chautengo, Guerrero. Extracción tradicional artesanal con métodos ancestrales.',
    storytelling: 'La pureza del mar Pacífico en cristales blancos',
    metricas: {
      co2: '0.8 kg CO₂',
      agua: '20L agua',
      plastico: '12g plástico evitado'
    }
  },
  {
    id: 'vinagre-manzana-250ml',
    nombre: 'Vinagre de Manzana Orgánico',
    precio: 75.00,
    unidad: '250ml',
    imagen: '/products/vinagre-manzana.jpg',
    productor: 'Vinagres Artesanales',
    ubicacion: 'Chihuahua, México',
    categoria: 'condimentos',
    rating: 4.8,
    reviews: 156,
    stock: 40,
    badges: ['Orgánico', 'Fermentado Natural'],
    descripcion: 'Vinagre de manzana orgánico fermentado naturalmente. Ideal para aderezos y usos culinarios.',
    storytelling: 'Fermentación natural para sabores auténticos',
    metricas: {
      co2: '1.2 kg CO₂',
      agua: '28L agua',
      plastico: '18g plástico evitado'
    }
  },
  {
    id: 'acelga-comun-200g',
    nombre: 'Acelga Común Fresca',
    precio: 15.00,
    unidad: '200g',
    imagen: '/products/acelga-comun.jpg',
    productor: 'Huertos Urbanos',
    ubicacion: 'Estado de México',
    categoria: 'verduras',
    rating: 4.5,
    reviews: 89,
    stock: 75,
    badges: ['Hojas Verdes', 'Rica en Hierro'],
    descripcion: 'Acelga fresca común, rica en hierro y vitaminas. Perfecta para ensaladas y guisos.',
    storytelling: 'Verde intenso cargado de nutrición',
    metricas: {
      co2: '0.3 kg CO₂',
      agua: '8L agua',
      plastico: '5g plástico evitado'
    }
  },
  {
    id: 'esparrago-fresco-500g',
    nombre: 'Espárrago Fresco Premium',
    precio: 125.00,
    unidad: '500g',
    imagen: '/products/esparrago-fresco.jpg',
    productor: 'Espárragos de Sonora',
    ubicacion: 'Sonora, México',
    categoria: 'verduras',
    rating: 4.9,
    reviews: 167,
    stock: 25,
    badges: ['Premium', 'Temporada Limitada'],
    descripcion: 'Espárragos frescos premium de Sonora. Tiernos, sabrosos y de temporada limitada.',
    storytelling: 'El lujo verde del desierto sonorense',
    metricas: {
      co2: '2.8 kg CO₂',
      agua: '65L agua',
      plastico: '15g plástico evitado'
    }
  },
  
  // MÁS PROTEÍNAS REGENERATIVAS
  {
    id: 'caldo-huesos-res-700ml',
    nombre: 'Caldo de Huesos de Res',
    precio: 120.00,
    unidad: '700ml',
    imagen: '/products/caldo-huesos-res.jpg',
    productor: 'Rancho Risueño',
    ubicacion: 'Veracruz, México',
    categoria: 'proteinas',
    rating: 4.8,
    reviews: 134,
    stock: 25,
    badges: ['Rico en Colágeno', 'Cocción 18 Horas'],
    descripcion: 'Caldo de huesos elaborado con carne y huesos de res, sazonado con verduras naturales. Rico en colágeno y minerales.',
    storytelling: 'Nutrición ancestral para la salud moderna',
    metricas: {
      co2: '6.5 kg CO₂ capturado',
      agua: '95L agua',
      plastico: '50g plástico evitado'
    }
  },
  {
    id: 'carne-pavo-hamburguesa-500g',
    nombre: 'Carne de Pavo para Hamburguesa',
    precio: 220.00,
    unidad: '500g',
    imagen: '/products/carne-pavo-hamburguesa.jpg',
    productor: 'Granja Paraíso Gourmet',
    ubicacion: 'Amanalco, México',
    categoria: 'proteinas',
    rating: 4.7,
    reviews: 98,
    stock: 30,
    badges: ['Pavo Regenerativo', 'Baja en Grasa'],
    descripcion: 'Carne de pavo regenerativo molida, ideal para hamburguesas saludables. Criado de manera sostenible.',
    storytelling: 'Sabor saludable de aves criadas en libertad',
    metricas: {
      co2: '5.2 kg CO₂ capturado',
      agua: '78L agua',
      plastico: '35g plástico evitado'
    }
  },
  {
    id: 'carne-res-molida-500g',
    nombre: 'Carne de Res Molida Regenerativa',
    precio: 171.00,
    unidad: '500g',
    imagen: '/products/carne-res-molida.jpg',
    productor: 'Rancho Triple Cinco',
    ubicacion: 'Veracruz, México',
    categoria: 'proteinas',
    rating: 4.8,
    reviews: 145,
    stock: 40,
    badges: ['Regenerativa Certificada', '15 Años Experiencia'],
    descripcion: 'Carne de res molida de ganadería regenerativa. Más de 15 años regenerando suelos y ecosistemas.',
    storytelling: 'Cada compra regenera la tierra',
    metricas: {
      co2: '7.8 kg CO₂ capturado',
      agua: '115L agua',
      plastico: '40g plástico evitado'
    }
  },
  {
    id: 'tocino-ahumado-350g',
    nombre: 'Tocino Ahumado Artesanal',
    precio: 245.00,
    unidad: '350g',
    imagen: '/products/tocino-ahumado.jpg',
    productor: 'Carnes Ahumadas del Valle',
    ubicacion: 'Jalisco, México',
    categoria: 'proteinas',
    rating: 4.9,
    reviews: 167,
    stock: 20,
    badges: ['Ahumado Natural', 'Sin Nitratos'],
    descripcion: 'Tocino ahumado artesanalmente sin nitratos ni conservadores artificiales. Sabor intenso y natural.',
    storytelling: 'El ahumado perfecto según la tradición',
    metricas: {
      co2: '4.2 kg CO₂ capturado',
      agua: '85L agua',
      plastico: '30g plástico evitado'
    }
  },
  
  // NUECES Y SEMILLAS PREMIUM
  {
    id: 'macadamia-100g',
    nombre: 'Macadamia Premium',
    precio: 78.00,
    unidad: '100g',
    imagen: '/products/macadamia.jpg',
    productor: 'Nueces Tropicales',
    ubicacion: 'Veracruz, México',
    categoria: 'granos',
    rating: 4.9,
    reviews: 145,
    stock: 35,
    badges: ['Premium', 'Rica en Omega-3'],
    descripcion: 'Macadamias premium con textura cremosa y sabor suave. Rica en omega-3 y grasas saludables.',
    storytelling: 'La nuez más fina del trópico mexicano',
    metricas: {
      co2: '1.2 kg CO₂',
      agua: '35L agua',
      plastico: '8g plástico evitado'
    }
  },
  {
    id: 'nuez-pecana-100g',
    nombre: 'Nuez Pecana Natural',
    precio: 63.00,
    unidad: '100g',
    imagen: '/products/nuez-pecana.jpg',
    productor: 'Nogales del Norte',
    ubicacion: 'Chihuahua, México',
    categoria: 'granos',
    rating: 4.8,
    reviews: 189,
    stock: 50,
    badges: ['Natural', 'Sin Sal'],
    descripcion: 'Nuez pecana natural sin sal ni aditivos. Perfecta para repostearía y snacks saludables.',
    storytelling: 'Dulzura natural de los nogales del norte',
    metricas: {
      co2: '1.5 kg CO₂',
      agua: '42L agua',
      plastico: '8g plástico evitado'
    }
  },
  {
    id: 'pepita-calabaza-100g',
    nombre: 'Pepita de Calabaza Tostada',
    precio: 31.00,
    unidad: '100g',
    imagen: '/products/pepita-calabaza.jpg',
    productor: 'Semillas del Campo',
    ubicacion: 'Puebla, México',
    categoria: 'granos',
    rating: 4.6,
    reviews: 123,
    stock: 75,
    badges: ['Tostada Natural', 'Rica en Zinc'],
    descripcion: 'Pepitas de calabaza tostadas naturalmente. Ricas en zinc, magnesio y proteína vegetal.',
    storytelling: 'El snack tradicional mexicano más nutritivo',
    metricas: {
      co2: '0.8 kg CO₂',
      agua: '22L agua',
      plastico: '6g plástico evitado'
    }
  },
  {
    id: 'semilla-girasol-100g',
    nombre: 'Semilla de Girasol Natural',
    precio: 13.00,
    unidad: '100g',
    imagen: '/products/semilla-girasol.jpg',
    productor: 'Girasoles del Bajío',
    ubicacion: 'Guanajuato, México',
    categoria: 'granos',
    rating: 4.5,
    reviews: 156,
    stock: 90,
    badges: ['Natural', 'Fuente de Vitamina E'],
    descripcion: 'Semillas de girasol naturales, fuente excelente de vitamina E y grasas saludables.',
    storytelling: 'Energía solar concentrada en cada semilla',
    metricas: {
      co2: '0.4 kg CO₂',
      agua: '12L agua',
      plastico: '5g plástico evitado'
    }
  },
  
  // TORTILLAS Y MAÍZ NATIVO
  {
    id: 'tortilla-azul-600g',
    nombre: 'Tortilla de Maíz Azul',
    precio: 37.00,
    unidad: '600g',
    imagen: '/products/tortilla-azul.jpg',
    productor: 'Tortillería Tradicional',
    ubicacion: 'Tlaxcala, México',
    categoria: 'tortillas',
    rating: 4.8,
    reviews: 234,
    stock: 60,
    badges: ['Maíz Nativo', 'Antocianinas'],
    descripcion: 'Tortillas de maíz azul nativo, ricas en antocianinas y con sabor tradicional auténtico.',
    storytelling: 'El color sagrado del maíz ancestral',
    metricas: {
      co2: '1.2 kg CO₂',
      agua: '28L agua',
      plastico: '20g plástico evitado'
    }
  },
  {
    id: 'tortilla-blanca-600g',
    nombre: 'Tortilla de Maíz Blanco',
    precio: 37.00,
    unidad: '600g',
    imagen: '/products/tortilla-blanca.jpg',
    productor: 'Tortillería Tradicional',
    ubicacion: 'Tlaxcala, México',
    categoria: 'tortillas',
    rating: 4.7,
    reviews: 298,
    stock: 80,
    badges: ['Maíz Nativo', 'Textura Perfecta'],
    descripcion: 'Tortillas de maíz blanco nativo con textura perfecta y sabor tradicional. La base de la cocina mexicana.',
    storytelling: 'La esencia pura de México en cada tortilla',
    metricas: {
      co2: '1.1 kg CO₂',
      agua: '25L agua',
      plastico: '20g plástico evitado'
    }
  },
  
  // BEBIDAS NATURALES Y FERMENTADAS
  {
    id: 'agua-jamaica-500ml',
    nombre: 'Agua de Jamaica Natural',
    precio: 35.00,
    unidad: '500ml',
    imagen: '/products/agua-jamaica.jpg',
    productor: 'Bebidas Artesanales',
    ubicacion: 'Oaxaca, México',
    categoria: 'bebidas',
    rating: 4.6,
    reviews: 142,
    stock: 55,
    badges: ['Sin Azúcares', 'Antioxidantes'],
    descripcion: 'Agua de jamaica natural sin azúcares añadidos. Rica en antioxidantes y vitamina C.',
    storytelling: 'La frescura floral de Oaxaca en cada sorbo',
    metricas: {
      co2: '0.8 kg CO₂',
      agua: '12L agua',
      plastico: '15g plástico evitado'
    }
  },
  {
    id: 'kombucha-jengibre-400ml',
    nombre: 'Kombucha de Jengibre',
    precio: 85.00,
    unidad: '400ml',
    imagen: '/products/kombucha-jengibre.jpg',
    productor: 'Fermentos Vivos',
    ubicacion: 'Ciudad de México',
    categoria: 'bebidas',
    rating: 4.8,
    reviews: 98,
    stock: 30,
    badges: ['Probióticos', 'Fermentado Natural'],
    descripcion: 'Kombucha artesanal de jengibre con probióticos vivos. Fermentación natural de 14 días.',
    storytelling: 'Vida microbiana ancestral para tu bienestar',
    metricas: {
      co2: '1.5 kg CO₂',
      agua: '25L agua',
      plastico: '20g plástico evitado'
    }
  },
  {
    id: 'jugo-verde-250ml',
    nombre: 'Jugo Verde Detox',
    precio: 45.00,
    unidad: '250ml',
    imagen: '/products/jugo-verde-detox.jpg',
    productor: 'Jugos Frescos del Valle',
    ubicacion: 'Morelos, México',
    categoria: 'bebidas',
    rating: 4.7,
    reviews: 167,
    stock: 40,
    badges: ['Prensado en Frío', 'Detox Natural'],
    descripcion: 'Jugo verde detox con apio, pepino, espinaca y limón. Prensado en frío para conservar nutrientes.',
    storytelling: 'Energía verde concentrada de la huerta',
    metricas: {
      co2: '1.2 kg CO₂',
      agua: '35L agua',
      plastico: '12g plástico evitado'
    }
  },
  
  // CONSERVAS Y FERMENTADOS
  {
    id: 'chucrut-col-300g',
    nombre: 'Chucrut de Col Morada',
    precio: 95.00,
    unidad: '300g',
    imagen: '/products/chucrut-col-morada.jpg',
    productor: 'Fermentados Tradicionales',
    ubicacion: 'Puebla, México',
    categoria: 'otros',
    rating: 4.8,
    reviews: 89,
    stock: 25,
    badges: ['Fermentado Natural', 'Probióticos Vivos'],
    descripcion: 'Chucrut artesanal de col morada fermentado naturalmente. Rico en probióticos y enzimas digestivas.',
    storytelling: 'Tradición europea con ingredientes mexicanos',
    metricas: {
      co2: '1.4 kg CO₂',
      agua: '18L agua',
      plastico: '15g plástico evitado'
    }
  },
  {
    id: 'kimchi-napa-250g',
    nombre: 'Kimchi de Col Napa',
    precio: 110.00,
    unidad: '250g',
    imagen: '/products/kimchi-napa.jpg',
    productor: 'Asia-México Fermentos',
    ubicacion: 'Ciudad de México',
    categoria: 'otros',
    rating: 4.9,
    reviews: 145,
    stock: 20,
    badges: ['Picante Natural', 'Superalimento'],
    descripcion: 'Kimchi tradicional coreano elaborado con col napa mexicana y chiles locales. Fermentación artesanal.',
    storytelling: 'Fusión cultural en cada bocado fermentado',
    metricas: {
      co2: '1.6 kg CO₂',
      agua: '22L agua',
      plastico: '12g plástico evitado'
    }
  },
  {
    id: 'salsa-fermentada-habanero-150ml',
    nombre: 'Salsa Fermentada de Habanero',
    precio: 85.00,
    unidad: '150ml',
    imagen: '/products/salsa-fermentada-habanero.jpg',
    productor: 'Salsas Ancestrales',
    ubicacion: 'Yucatán, México',
    categoria: 'condimentos',
    rating: 4.7,
    reviews: 234,
    stock: 45,
    badges: ['Picante Extremo', 'Fermentación Ancestral'],
    descripcion: 'Salsa de habanero fermentada con métodos ancestrales mayas. Sabor complejo y picor balanceado.',
    storytelling: 'El fuego sagrado de los antiguos mayas',
    metricas: {
      co2: '1.1 kg CO₂',
      agua: '15L agua',
      plastico: '8g plástico evitado'
    }
  },
  
  // FRUTAS DE TEMPORADA PREMIUM
  {
    id: 'mamey-organico-800g',
    nombre: 'Mamey Orgánico',
    precio: 65.00,
    unidad: '800g',
    imagen: '/products/mamey-organico.jpg',
    productor: 'Frutales del Sureste',
    ubicacion: 'Chiapas, México',
    categoria: 'frutas',
    rating: 4.9,
    reviews: 89,
    stock: 15,
    badges: ['Orgánico', 'Fruta Tropical'],
    descripcion: 'Mamey orgánico de Chiapas con pulpa cremosa y sabor dulce natural. Rico en vitamina A y potasio.',
    storytelling: 'El tesoro dorado de los trópicos mexicanos',
    metricas: {
      co2: '2.1 kg CO₂',
      agua: '45L agua',
      plastico: '5g plástico evitado'
    }
  },
  {
    id: 'pitaya-roja-400g',
    nombre: 'Pitaya Roja Dragon Fruit',
    precio: 95.00,
    unidad: '400g',
    imagen: '/products/pitaya-roja.jpg',
    productor: 'Cactus Frutales',
    ubicacion: 'Baja California, México',
    categoria: 'frutas',
    rating: 4.8,
    reviews: 156,
    stock: 25,
    badges: ['Superfruit', 'Bajo en Calorías'],
    descripcion: 'Pitaya roja o fruta del dragón, rica en antioxidantes y baja en calorías. Sabor suave y refrescante.',
    storytelling: 'La magia colorida del desierto mexicano',
    metricas: {
      co2: '1.8 kg CO₂',
      agua: '38L agua',
      plastico: '8g plástico evitado'
    }
  },
  {
    id: 'jicama-fresca-600g',
    nombre: 'Jícama Fresca Crujiente',
    precio: 28.00,
    unidad: '600g',
    imagen: '/products/jicama-fresca.jpg',
    productor: 'Raíces Mexicanas',
    ubicacion: 'Nayarit, México',
    categoria: 'verduras',
    rating: 4.6,
    reviews: 198,
    stock: 70,
    badges: ['Hidratante', 'Rica en Fibra'],
    descripcion: 'Jícama fresca y crujiente, perfecta para ensaladas y snacks. Alta en fibra y muy hidratante.',
    storytelling: 'La frescura crujiente de las raíces mexicanas',
    metricas: {
      co2: '0.9 kg CO₂',
      agua: '18L agua',
      plastico: '5g plástico evitado'
    }
  },
  
  // PRODUCTOS DE CUIDADO PERSONAL NATURAL
  {
    id: 'jabon-avena-miel-100g',
    nombre: 'Jabón de Avena y Miel',
    precio: 55.00,
    unidad: '100g',
    imagen: '/products/jabon-avena-miel.jpg',
    productor: 'Cosmética Natural Mexicana',
    ubicacion: 'Oaxaca, México',
    categoria: 'otros',
    rating: 4.7,
    reviews: 234,
    stock: 60,
    badges: ['100% Natural', 'Piel Sensible'],
    descripcion: 'Jabón artesanal de avena y miel para piel sensible. Sin químicos agresivos ni conservadores artificiales.',
    storytelling: 'Cuidado ancestral para tu piel moderna',
    metricas: {
      co2: '0.6 kg CO₂',
      agua: '8L agua',
      plastico: '3g plástico evitado'
    }
  },
  {
    id: 'aceite-coco-organico-200ml',
    nombre: 'Aceite de Coco Orgánico Extra Virgen',
    precio: 125.00,
    unidad: '200ml',
    imagen: '/products/aceite-coco-organico.jpg',
    productor: 'Palmeras del Pacífico',
    ubicacion: 'Colima, México',
    categoria: 'aceites',
    rating: 4.9,
    reviews: 167,
    stock: 40,
    badges: ['Extra Virgen', 'Multifuncional'],
    descripcion: 'Aceite de coco extra virgen orgánico. Ideal para cocinar, cuidado de la piel y el cabello.',
    storytelling: 'La versatilidad tropical en tu hogar',
    metricas: {
      co2: '2.2 kg CO₂',
      agua: '55L agua',
      plastico: '15g plástico evitado'
    }
  },
  
  // VERDURAS ORGÁNICAS DE TEMPORADA
  {
    id: 'kale-organico-200g',
    nombre: 'Kale Orgánico Rizado',
    precio: 42.00,
    unidad: '200g',
    imagen: '/products/kale-organico.jpg',
    productor: 'SuperVerduras Orgánicas',
    ubicacion: 'Estado de México',
    categoria: 'verduras',
    rating: 4.8,
    reviews: 189,
    stock: 45,
    badges: ['Orgánico Certificado', 'Superalimento'],
    descripcion: 'Kale orgánico rizado, rico en vitamina K, hierro y antioxidantes. Perfecto para smoothies y ensaladas.',
    storytelling: 'El poder verde que tu cuerpo necesita',
    metricas: {
      co2: '0.4 kg CO₂',
      agua: '12L agua',
      plastico: '5g plástico evitado'
    }
  },
  {
    id: 'apio-organico-500g',
    nombre: 'Apio Orgánico Fresco',
    precio: 35.00,
    unidad: '500g',
    imagen: '/products/apio-organico.jpg',
    productor: 'Hortalizas Ecológicas',
    ubicacion: 'Puebla, México',
    categoria: 'verduras',
    rating: 4.6,
    reviews: 134,
    stock: 60,
    badges: ['Orgánico', 'Rico en Fibra'],
    descripcion: 'Apio orgánico fresco y crujiente, ideal para jugos, sopas y ensaladas. Rico en fibra y minerales.',
    storytelling: 'Frescura crujiente directo del huerto',
    metricas: {
      co2: '0.6 kg CO₂',
      agua: '18L agua',
      plastico: '8g plástico evitado'
    }
  },
  {
    id: 'coliflor-morada-600g',
    nombre: 'Coliflor Morada Orgánica',
    precio: 58.00,
    unidad: '600g',
    imagen: '/products/coliflor-morada.jpg',
    productor: 'Coloridos del Campo',
    ubicacion: 'Guanajuato, México',
    categoria: 'verduras',
    rating: 4.9,
    reviews: 98,
    stock: 25,
    badges: ['Variedad Especial', 'Antocianinas'],
    descripcion: 'Coliflor morada orgánica rica en antocianinas y nutrientes. Sabor suave y color espectacular.',
    storytelling: 'El arco iris nutritivo en tu plato',
    metricas: {
      co2: '1.1 kg CO₂',
      agua: '28L agua',
      plastico: '12g plástico evitado'
    }
  },
  
  // PANADERÍA ARTESANAL
  {
    id: 'pan-integral-centeno-500g',
    nombre: 'Pan Integral de Centeno',
    precio: 75.00,
    unidad: '500g',
    imagen: '/products/pan-integral-centeno.jpg',
    productor: 'Panadería Artesanal El Grano',
    ubicacion: 'Ciudad de México',
    categoria: 'harinas',
    rating: 4.8,
    reviews: 167,
    stock: 30,
    badges: ['100% Integral', 'Fermentación Natural'],
    descripcion: 'Pan artesanal de centeno 100% integral con fermentación natural. Textura densa y sabor rústico.',
    storytelling: 'La tradición panificadora en cada rebanada',
    metricas: {
      co2: '1.8 kg CO₂',
      agua: '35L agua',
      plastico: '20g plástico evitado'
    }
  },
  {
    id: 'croissants-mantequilla-4pzs',
    nombre: 'Croissants de Mantequilla Artesanales',
    precio: 95.00,
    unidad: '4 piezas',
    imagen: '/products/croissants-mantequilla.jpg',
    productor: 'Bolleria Francesa México',
    ubicacion: 'Ciudad de México',
    categoria: 'harinas',
    rating: 4.9,
    reviews: 145,
    stock: 20,
    badges: ['Técnica Francesa', 'Hojaldrado Perfecto'],
    descripcion: 'Croissants artesanales elaborados con técnica francesa tradicional. Mantequilla de alta calidad y hojaldrado perfecto.',
    storytelling: 'París en tu mesa cada mañana',
    metricas: {
      co2: '2.2 kg CO₂',
      agua: '45L agua',
      plastico: '25g plástico evitado'
    }
  },
  {
    id: 'galletas-avena-cranberry-250g',
    nombre: 'Galletas de Avena y Cranberry',
    precio: 68.00,
    unidad: '250g',
    imagen: '/products/galletas-avena-cranberry.jpg',
    productor: 'Repostería Saludable',
    ubicacion: 'Morelos, México',
    categoria: 'harinas',
    rating: 4.7,
    reviews: 234,
    stock: 50,
    badges: ['Sin Azúcar Refinada', 'Fibra Natural'],
    descripcion: 'Galletas artesanales de avena y cranberry endulzadas con miel. Sin azúcar refinada ni conservadores.',
    storytelling: 'Dulzura natural para tus momentos especiales',
    metricas: {
      co2: '1.5 kg CO₂',
      agua: '32L agua',
      plastico: '15g plástico evitado'
    }
  },
  
  // SEMILLAS PARA HUERTO
  {
    id: 'semillas-tomate-cherry-sobre',
    nombre: 'Semillas de Jitomate Cherry',
    precio: 25.00,
    unidad: '1 sobre',
    imagen: '/products/semillas-tomate-cherry.jpg',
    productor: 'Semillero Mexicano',
    ubicacion: 'Guanajuato, México',
    categoria: 'otros',
    rating: 4.6,
    reviews: 189,
    stock: 100,
    badges: ['Variedad Heirloom', 'Alta Germinación'],
    descripcion: 'Semillas de jitomate cherry variedad heirloom con 95% de germinación. Incluye instrucciones de cultivo.',
    storytelling: 'Cultiva tus propios tesoros rojos',
    metricas: {
      co2: '0.1 kg CO₂',
      agua: '2L agua',
      plastico: '2g plástico evitado'
    }
  },
  {
    id: 'semillas-lechuga-mixta-sobre',
    nombre: 'Semillas de Lechuga Mixta',
    precio: 20.00,
    unidad: '1 sobre',
    imagen: '/products/semillas-lechuga-mixta.jpg',
    productor: 'Huertos Urbanos Semillas',
    ubicacion: 'Estado de México',
    categoria: 'otros',
    rating: 4.7,
    reviews: 156,
    stock: 80,
    badges: ['Mezcla de Variedades', 'Fácil Cultivo'],
    descripcion: 'Mezcla de semillas de lechuga: romana, batavia y oak leaf. Ideal para huertos urbanos y principiantes.',
    storytelling: 'Tu ensalada comienza aquí',
    metricas: {
      co2: '0.1 kg CO₂',
      agua: '1.5L agua',
      plastico: '1g plástico evitado'
    }
  },
  {
    id: 'semillas-cilantro-perejil-kit',
    nombre: 'Kit Semillas Cilantro y Perejil',
    precio: 35.00,
    unidad: '1 kit',
    imagen: '/products/kit-semillas-hierbas.jpg',
    productor: 'Verde en Casa',
    ubicacion: 'Puebla, México',
    categoria: 'otros',
    rating: 4.8,
    reviews: 198,
    stock: 65,
    badges: ['Kit Completo', 'Hierbas Aromáticas'],
    descripcion: 'Kit completo con semillas de cilantro y perejil, macetas biodegradables y sustrato. Todo listo para sembrar.',
    storytelling: 'Hierbas frescas siempre a tu alcance',
    metricas: {
      co2: '0.2 kg CO₂',
      agua: '3L agua',
      plastico: '5g plástico evitado'
    }
  },
  
  // APICULTURA ESPECIALIZADA
  {
    id: 'polen-abeja-100g',
    nombre: 'Polen de Abeja Natural',
    precio: 145.00,
    unidad: '100g',
    imagen: '/products/polen-abeja.jpg',
    productor: 'Apiario Sierra Madre',
    ubicacion: 'Michoacán, México',
    categoria: 'endulzantes',
    rating: 4.9,
    reviews: 134,
    stock: 25,
    badges: ['Superalimento', 'Energía Natural'],
    descripcion: 'Polen de abeja natural rico en proteínas, vitaminas y minerales. Recolectado de flores silvestres.',
    storytelling: 'La energía concentrada de mil flores',
    metricas: {
      co2: '0.8 kg CO₂ capturado',
      agua: '15L agua',
      plastico: '8g plástico evitado'
    }
  },
  {
    id: 'propoleo-tintura-30ml',
    nombre: 'Tinétura de Propóleo',
    precio: 185.00,
    unidad: '30ml',
    imagen: '/products/propoleo-tintura.jpg',
    productor: 'Productos Apícolas Naturales',
    ubicacion: 'Jalisco, México',
    categoria: 'otros',
    rating: 4.8,
    reviews: 98,
    stock: 35,
    badges: ['Antimicrobiano Natural', 'Defensa Inmune'],
    descripcion: 'Tintura de propóleo natural con propiedades antimicrobianas. Fortalece el sistema inmunológico.',
    storytelling: 'La farmacia natural de las abejas',
    metricas: {
      co2: '0.5 kg CO₂ capturado',
      agua: '8L agua',
      plastico: '5g plástico evitado'
    }
  },
  {
    id: 'cera-abeja-natural-200g',
    nombre: 'Cera de Abeja Natural',
    precio: 125.00,
    unidad: '200g',
    imagen: '/products/cera-abeja-natural.jpg',
    productor: 'Ceras y Mieles del Valle',
    ubicacion: 'Morelos, México',
    categoria: 'otros',
    rating: 4.7,
    reviews: 167,
    stock: 40,
    badges: ['100% Pura', 'Usos Múltiples'],
    descripcion: 'Cera de abeja 100% natural para cosmticos, velas y productos artesanales. Sin procesar químicamente.',
    storytelling: 'La creación perfecta de la naturaleza',
    metricas: {
      co2: '1.2 kg CO₂ capturado',
      agua: '22L agua',
      plastico: '10g plástico evitado'
    }
  },
  
  // HONGOS Y SETAS ESPECIALES
  {
    id: 'hongos-shiitake-frescos-200g',
    nombre: 'Hongos Shiitake Frescos',
    precio: 95.00,
    unidad: '200g',
    imagen: '/products/hongos-shiitake.jpg',
    productor: 'Hongos Gourmet México',
    ubicacion: 'Estado de México',
    categoria: 'verduras',
    rating: 4.9,
    reviews: 156,
    stock: 20,
    badges: ['Gourmet', 'Rico en Umami'],
    descripcion: 'Hongos shiitake frescos cultivados en sustrato orgánico. Sabor intenso y textura perfecta para platillos asiáticos.',
    storytelling: 'El sabor umami que revolucionará tu cocina',
    metricas: {
      co2: '1.2 kg CO₂',
      agua: '15L agua',
      plastico: '8g plástico evitado'
    }
  },
  {
    id: 'setas-ostra-amarillas-300g',
    nombre: 'Setas Ostra Amarillas',
    precio: 75.00,
    unidad: '300g',
    imagen: '/products/setas-ostra-amarillas.jpg',
    productor: 'Cultivos Micóticos',
    ubicacion: 'Puebla, México',
    categoria: 'verduras',
    rating: 4.8,
    reviews: 189,
    stock: 35,
    badges: ['Cultivadas Localmente', 'Proteína Vegetal'],
    descripcion: 'Setas ostra amarillas frescas con alto contenido de proteína vegetal. Sabor suave y textura tierna.',
    storytelling: 'Flores doradas del reino fungi',
    metricas: {
      co2: '0.8 kg CO₂',
      agua: '12L agua',
      plastico: '6g plástico evitado'
    }
  },
  {
    id: 'hongos-portobello-grandes-400g',
    nombre: 'Hongos Portobello Grandes',
    precio: 85.00,
    unidad: '400g',
    imagen: '/products/hongos-portobello.jpg',
    productor: 'Hongos Premium del Valle',
    ubicacion: 'Tlaxcala, México',
    categoria: 'verduras',
    rating: 4.7,
    reviews: 234,
    stock: 40,
    badges: ['Extra Grandes', 'Perfectos para Asar'],
    descripcion: 'Hongos portobello extra grandes ideales para asar o rellenar. Textura carnosa y sabor intenso.',
    storytelling: 'La alternativa perfecta a la carne',
    metricas: {
      co2: '1.0 kg CO₂',
      agua: '18L agua',
      plastico: '10g plástico evitado'
    }
  },
  
  // VINAGRES ESPECIALIZADOS
  {
    id: 'vinagre-balsamico-modena-250ml',
    nombre: 'Vinagre Balsámico de Modena',
    precio: 185.00,
    unidad: '250ml',
    imagen: '/products/vinagre-balsamico-modena.jpg',
    productor: 'Importaciones Gourmet',
    ubicacion: 'Modena, Italia (Importado)',
    categoria: 'condimentos',
    rating: 4.9,
    reviews: 145,
    stock: 25,
    badges: ['IGP Certificado', 'Añejado 12 Años'],
    descripcion: 'Vinagre balsámico de Modena IGP añejado 12 años. Sabor dulce y complejo, ideal para ensaladas gourmet.',
    storytelling: 'La tradición italiana en cada gota',
    metricas: {
      co2: '3.2 kg CO₂',
      agua: '45L agua',
      plastico: '15g plástico evitado'
    }
  },
  {
    id: 'vinagre-vino-tinto-artesanal-500ml',
    nombre: 'Vinagre de Vino Tinto Artesanal',
    precio: 125.00,
    unidad: '500ml',
    imagen: '/products/vinagre-vino-tinto.jpg',
    productor: 'Viñedos y Vinagres',
    ubicacion: 'Querrétaro, México',
    categoria: 'condimentos',
    rating: 4.7,
    reviews: 98,
    stock: 30,
    badges: ['Artesanal', 'Uvas Mexicanas'],
    descripcion: 'Vinagre artesanal de vino tinto elaborado con uvas mexicanas. Fermentación lenta y sabor profundo.',
    storytelling: 'Del viñedo mexicano a tu mesa',
    metricas: {
      co2: '2.8 kg CO₂',
      agua: '85L agua',
      plastico: '20g plástico evitado'
    }
  },
  {
    id: 'vinagre-jerez-reserva-250ml',
    nombre: 'Vinagre de Jerez Reserva',
    precio: 165.00,
    unidad: '250ml',
    imagen: '/products/vinagre-jerez-reserva.jpg',
    productor: 'Bodegas Andaluzas',
    ubicacion: 'Jerez, España (Importado)',
    categoria: 'condimentos',
    rating: 4.8,
    reviews: 134,
    stock: 20,
    badges: ['DO Jerez', 'Solera Tradicional'],
    descripcion: 'Vinagre de Jerez DO elaborado por sistema solera. Sabor complejo y aroma intenso, perfecto para mariscos.',
    storytelling: 'El secreto andaluz de los grandes chefs',
    metricas: {
      co2: '3.5 kg CO₂',
      agua: '55L agua',
      plastico: '12g plástico evitado'
    }
  },
  
  // CHILES Y SALSAS REGIONALES
  {
    id: 'chile-habanero-chocolate-100g',
    nombre: 'Chile Habanero Chocolate',
    precio: 45.00,
    unidad: '100g',
    imagen: '/products/chile-habanero-chocolate.jpg',
    productor: 'Chiles del Sureste',
    ubicacion: 'Yucatán, México',
    categoria: 'especias',
    rating: 4.8,
    reviews: 189,
    stock: 50,
    badges: ['Variedad Única', 'Picante Extremo'],
    descripcion: 'Chile habanero chocolate con sabor ahumado y picor intenso. Variedad endémica de Yucatán.',
    storytelling: 'El fuego sagrado de los mayas contemporáneos',
    metricas: {
      co2: '0.6 kg CO₂',
      agua: '15L agua',
      plastico: '5g plástico evitado'
    }
  },
  {
    id: 'salsa-macha-oaxaquena-200ml',
    nombre: 'Salsa Macha Oaxaqueña',
    precio: 95.00,
    unidad: '200ml',
    imagen: '/products/salsa-macha-oaxaquena.jpg',
    productor: 'Salsas Ancestrales de Oaxaca',
    ubicacion: 'Oaxaca, México',
    categoria: 'condimentos',
    rating: 4.9,
    reviews: 256,
    stock: 35,
    badges: ['Receta Tradicional', 'Chiles Tostados'],
    descripcion: 'Salsa macha tradicional oaxaqueña con chiles tostados, almendras y especias. Sabor ahumado inigualable.',
    storytelling: 'El alma de Oaxaca en cada gota dorada',
    metricas: {
      co2: '1.8 kg CO₂',
      agua: '35L agua',
      plastico: '15g plástico evitado'
    }
  },
  {
    id: 'chile-morita-seco-150g',
    nombre: 'Chile Morita Seco',
    precio: 55.00,
    unidad: '150g',
    imagen: '/products/chile-morita-seco.jpg',
    productor: 'Chiles Secos del Centro',
    ubicacion: 'Puebla, México',
    categoria: 'especias',
    rating: 4.7,
    reviews: 167,
    stock: 75,
    badges: ['Ahumado Natural', 'Sabor Dulce'],
    descripcion: 'Chile morita seco con sabor ahumado y notas dulces. Ideal para salsas, adobos y platillos tradicionales.',
    storytelling: 'El sabor ahumado que define México',
    metricas: {
      co2: '1.2 kg CO₂',
      agua: '25L agua',
      plastico: '8g plástico evitado'
    }
  },
  
  // PRODUCTOS FERMENTADOS ASIÁTICOS
  {
    id: 'miso-pasta-organico-500g',
    nombre: 'Pasta de Miso Orgánico',
    precio: 165.00,
    unidad: '500g',
    imagen: '/products/miso-pasta-organico.jpg',
    productor: 'Fermentos Asia-México',
    ubicacion: 'Ciudad de México',
    categoria: 'condimentos',
    rating: 4.8,
    reviews: 134,
    stock: 25,
    badges: ['Fermentado 18 Meses', 'Soja Orgánica'],
    descripcion: 'Pasta de miso orgánico fermentado 18 meses. Elaborado con soja mexicana orgánica y koji tradicional.',
    storytelling: 'La esencia umami fermentada con paciencia',
    metricas: {
      co2: '2.5 kg CO₂',
      agua: '95L agua',
      plastico: '25g plástico evitado'
    }
  },
  {
    id: 'salsa-soja-artesanal-250ml',
    nombre: 'Salsa de Soja Artesanal',
    precio: 125.00,
    unidad: '250ml',
    imagen: '/products/salsa-soja-artesanal.jpg',
    productor: 'Salsas Fermentadas Tradicionales',
    ubicacion: 'Ciudad de México',
    categoria: 'condimentos',
    rating: 4.9,
    reviews: 189,
    stock: 40,
    badges: ['Fermentación Tradicional', 'Sin Aditivos'],
    descripcion: 'Salsa de soja artesanal fermentada tradicionalmente sin aditivos químicos. Sabor profundo y complejo.',
    storytelling: 'La tradición milenaria en cada gota oscura',
    metricas: {
      co2: '2.2 kg CO₂',
      agua: '78L agua',
      plastico: '18g plástico evitado'
    }
  },
  {
    id: 'tempeh-fresco-250g',
    nombre: 'Tempeh Fresco Artesanal',
    precio: 85.00,
    unidad: '250g',
    imagen: '/products/tempeh-fresco.jpg',
    productor: 'Proteínas Fermentadas',
    ubicacion: 'Ciudad de México',
    categoria: 'proteinas',
    rating: 4.7,
    reviews: 145,
    stock: 30,
    badges: ['Proteína Completa', 'Probióticos'],
    descripcion: 'Tempeh fresco artesanal fermentado con hongos Rhizopus. Proteína completa rica en probióticos.',
    storytelling: 'La proteína fermentada que nutre y regenera',
    metricas: {
      co2: '1.8 kg CO₂',
      agua: '45L agua',
      plastico: '15g plástico evitado'
    }
  },
  
  // PRODUCTOS DE TEMPORADA NAVIDEÑA
  {
    id: 'ponche-navideo-concentrate-500ml',
    nombre: 'Concentrado de Ponche Navideño',
    precio: 125.00,
    unidad: '500ml',
    imagen: '/products/ponche-navideo-concentrado.jpg',
    productor: 'Tradiciones Navideñas',
    ubicacion: 'Puebla, México',
    categoria: 'bebidas',
    rating: 4.8,
    reviews: 198,
    stock: 45,
    badges: ['Temporada Limitada', 'Especias Tradicionales'],
    descripcion: 'Concentrado de ponche navideño con canela, clavo, tejocotes y caña. Solo agregar agua caliente.',
    storytelling: 'El calor de la Navidad mexicana en cada taza',
    metricas: {
      co2: '2.8 kg CO₂',
      agua: '65L agua',
      plastico: '20g plástico evitado'
    }
  },
  {
    id: 'rosca-reyes-artesanal-1kg',
    nombre: 'Rosca de Reyes Artesanal',
    precio: 385.00,
    unidad: '1kg',
    imagen: '/products/rosca-reyes-artesanal.jpg',
    productor: 'Panadería de los Reyes',
    ubicacion: 'Ciudad de México',
    categoria: 'harinas',
    rating: 4.9,
    reviews: 267,
    stock: 15,
    badges: ['Temporada Limitada', 'Receta Tradicional'],
    descripcion: 'Rosca de Reyes artesanal elaborada con receta tradicional. Incluye ate, higos cristalizados y muñecos.',
    storytelling: 'La magia de los Reyes Magos en cada rebanada',
    metricas: {
      co2: '5.2 kg CO₂',
      agua: '125L agua',
      plastico: '45g plástico evitado'
    }
  },
  {
    id: 'chocolate-caliente-abuela-250g',
    nombre: 'Chocolate Caliente de la Abuela',
    precio: 95.00,
    unidad: '250g',
    imagen: '/products/chocolate-caliente-abuela.jpg',
    productor: 'Chocolates Tradicionales',
    ubicacion: 'Tabasco, México',
    categoria: 'cafe',
    rating: 4.7,
    reviews: 189,
    stock: 60,
    badges: ['Receta Familiar', 'Cacao Puro'],
    descripcion: 'Chocolate caliente en polvo elaborado con cacao puro y especias. Receta familiar de tres generaciones.',
    storytelling: 'El abrazo cálido de la tradición familiar',
    metricas: {
      co2: '3.1 kg CO₂',
      agua: '85L agua',
      plastico: '15g plástico evitado'
    }
  },
  
  // HIERBAS MEDICINALES
  {
    id: 'hierba-buena-seca-50g',
    nombre: 'Hierbabuena Seca Medicinal',
    precio: 35.00,
    unidad: '50g',
    imagen: '/products/hierba-buena-seca.jpg',
    productor: 'Hierbas de la Abuela',
    ubicacion: 'Morelos, México',
    categoria: 'infusiones',
    rating: 4.6,
    reviews: 145,
    stock: 80,
    badges: ['Medicinal', 'Digestiva'],
    descripcion: 'Hierbabuena seca de cultivo orgánico. Excelente para infusiones digestivas y relajantes.',
    storytelling: 'El remedio verde de nuestras abuelas',
    metricas: {
      co2: '0.3 kg CO₂',
      agua: '8L agua',
      plastico: '3g plástico evitado'
    }
  },
  {
    id: 'gordolobo-medicinal-40g',
    nombre: 'Gordolobo Medicinal',
    precio: 45.00,
    unidad: '40g',
    imagen: '/products/gordolobo-medicinal.jpg',
    productor: 'Plantas Medicinales del Centro',
    ubicacion: 'Hidalgo, México',
    categoria: 'infusiones',
    rating: 4.8,
    reviews: 134,
    stock: 65,
    badges: ['Respiratoria', 'Tradicional'],
    descripcion: 'Gordolobo medicinal para afecciones respiratorias. Planta tradicional mexicana con propiedades expectorantes.',
    storytelling: 'El alivio natural para tu respiración',
    metricas: {
      co2: '0.2 kg CO₂',
      agua: '5L agua',
      plastico: '2g plástico evitado'
    }
  },
  {
    id: 'te-siete-azahares-30g',
    nombre: 'Té de Siete Azahares',
    precio: 55.00,
    unidad: '30g',
    imagen: '/products/te-siete-azahares.jpg',
    productor: 'Remedios Florales Tradicionales',
    ubicacion: 'Puebla, México',
    categoria: 'infusiones',
    rating: 4.9,
    reviews: 198,
    stock: 45,
    badges: ['Relajante Natural', 'Mezcla Tradicional'],
    descripcion: 'Té de siete azahares para la relajación y el sueño. Mezcla tradicional de flores medicinales.',
    storytelling: 'La serenidad floral en cada infusión',
    metricas: {
      co2: '0.4 kg CO₂',
      agua: '12L agua',
      plastico: '4g plástico evitado'
    }
  },
  
  // ALGAS Y SUPERALIMENTOS MARINOS
  {
    id: 'spirulina-polvo-100g',
    nombre: 'Spirulina en Polvo Orgánica',
    precio: 185.00,
    unidad: '100g',
    imagen: '/products/spirulina-polvo.jpg',
    productor: 'Superalimentos Marinos',
    ubicacion: 'Baja California, México',
    categoria: 'otros',
    rating: 4.8,
    reviews: 234,
    stock: 30,
    badges: ['Superalimento', 'Proteína Completa'],
    descripcion: 'Spirulina orgánica en polvo con 65% de proteína. Cultivada en lagunas salinas de Baja California.',
    storytelling: 'El poder verde azulado del océano',
    metricas: {
      co2: '2.1 kg CO₂ capturado',
      agua: '15L agua',
      plastico: '8g plástico evitado'
    }
  },
  {
    id: 'chlorella-tabletas-200tabs',
    nombre: 'Chlorella en Tabletas',
    precio: 165.00,
    unidad: '200 tabletas',
    imagen: '/products/chlorella-tabletas.jpg',
    productor: 'Microalgas del Pacífico',
    ubicacion: 'Sinaloa, México',
    categoria: 'otros',
    rating: 4.7,
    reviews: 156,
    stock: 40,
    badges: ['Desintoxicante', 'Rico en Clorofila'],
    descripcion: 'Chlorella en tabletas para desintoxicación natural. Rica en clorofila, vitaminas y minerales.',
    storytelling: 'La limpieza verde que tu cuerpo necesita',
    metricas: {
      co2: '1.8 kg CO₂ capturado',
      agua: '12L agua',
      plastico: '10g plástico evitado'
    }
  },
  {
    id: 'wakame-alga-seca-50g',
    nombre: 'Alga Wakame Seca',
    precio: 75.00,
    unidad: '50g',
    imagen: '/products/wakame-alga-seca.jpg',
    productor: 'Algas del Golfo',
    ubicacion: 'Veracruz, México',
    categoria: 'otros',
    rating: 4.6,
    reviews: 89,
    stock: 25,
    badges: ['Rica en Yodo', 'Sabor Marino'],
    descripcion: 'Alga wakame seca rica en yodo y minerales marinos. Perfecta para sopas miso y ensaladas asiáticas.',
    storytelling: 'El tesoro mineral de las profundidades',
    metricas: {
      co2: '0.8 kg CO₂ capturado',
      agua: '5L agua',
      plastico: '5g plástico evitado'
    }
  },
  
  // PRODUCTOS DE HIGIENE ECOLÓGICA
  {
    id: 'champu-solido-romero-80g',
    nombre: 'Champú Sólido de Romero',
    precio: 85.00,
    unidad: '80g',
    imagen: '/products/champu-solido-romero.jpg',
    productor: 'Cosmética Ecológica México',
    ubicacion: 'Oaxaca, México',
    categoria: 'otros',
    rating: 4.7,
    reviews: 167,
    stock: 55,
    badges: ['Cero Residuos', 'Cabello Graso'],
    descripcion: 'Champú sólido de romero para cabello graso. Sin sulfatos, parabenos ni empaque plástico.',
    storytelling: 'Cuidado capilar sin dañar el planeta',
    metricas: {
      co2: '1.2 kg CO₂',
      agua: '8L agua',
      plastico: '0g plástico evitado'
    }
  },
  {
    id: 'desodorante-cristal-alumbre-60g',
    nombre: 'Desodorante de Cristal de Alumbre',
    precio: 65.00,
    unidad: '60g',
    imagen: '/products/desodorante-cristal-alumbre.jpg',
    productor: 'Minerales Naturales',
    ubicacion: 'San Luis Potosí, México',
    categoria: 'otros',
    rating: 4.8,
    reviews: 234,
    stock: 70,
    badges: ['100% Natural', 'Larga Duración'],
    descripcion: 'Desodorante natural de cristal de alumbre sin químicos. Protección efectiva y duradera.',
    storytelling: 'La protección mineral que la naturaleza nos da',
    metricas: {
      co2: '0.5 kg CO₂',
      agua: '3L agua',
      plastico: '2g plástico evitado'
    }
  },
  {
    id: 'pasta-dental-carbon-activado-100g',
    nombre: 'Pasta Dental de Carbón Activado',
    precio: 95.00,
    unidad: '100g',
    imagen: '/products/pasta-dental-carbon.jpg',
    productor: 'Higiene Natural Mexicana',
    ubicacion: 'Ciudad de México',
    categoria: 'otros',
    rating: 4.6,
    reviews: 145,
    stock: 45,
    badges: ['Blanqueadora Natural', 'Sin Flúor'],
    descripcion: 'Pasta dental de carbón activado blanqueadora. Sin flúor, SLS ni conservadores artificiales.',
    storytelling: 'La sonrisa blanca y natural que mereces',
    metricas: {
      co2: '1.1 kg CO₂',
      agua: '15L agua',
      plastico: '8g plástico evitado'
    }
  },
  
  // COMPLEMENTOS NUTRICIONALES
  {
    id: 'levadura-nutricional-150g',
    nombre: 'Levadura Nutricional',
    precio: 125.00,
    unidad: '150g',
    imagen: '/products/levadura-nutricional.jpg',
    productor: 'Suplementos Naturales',
    ubicacion: 'Jalisco, México',
    categoria: 'otros',
    rating: 4.8,
    reviews: 189,
    stock: 40,
    badges: ['Rico en Vitamina B12', 'Sabor a Queso'],
    descripcion: 'Levadura nutricional rica en vitamina B12 y proteínas. Sabor a queso ideal para veganos.',
    storytelling: 'El queso dorado de la alimentación vegana',
    metricas: {
      co2: '1.5 kg CO₂',
      agua: '25L agua',
      plastico: '12g plástico evitado'
    }
  },
  {
    id: 'proteina-hemp-250g',
    nombre: 'Proteína de Hemp Orgánica',
    precio: 285.00,
    unidad: '250g',
    imagen: '/products/proteina-hemp.jpg',
    productor: 'Hemp México Orgánico',
    ubicacion: 'Michoacán, México',
    categoria: 'proteinas',
    rating: 4.9,
    reviews: 145,
    stock: 25,
    badges: ['Proteína Completa', 'Omega 3-6-9'],
    descripcion: 'Proteína de hemp orgánica con perfil completo de aminoácidos. Rica en omega 3-6-9.',
    storytelling: 'La proteína más completa de la naturaleza',
    metricas: {
      co2: '2.8 kg CO₂ capturado',
      agua: '35L agua',
      plastico: '15g plástico evitado'
    }
  },
  
  // PRODUCTOS GOURMET PREMIUM
  {
    id: 'trufa-negra-mexicana-20g',
    nombre: 'Trufa Negra Mexicana',
    precio: 485.00,
    unidad: '20g',
    imagen: '/products/trufa-negra-mexicana.jpg',
    productor: 'Trufas Gourmet de México',
    ubicacion: 'Tlaxcala, México',
    categoria: 'especias',
    rating: 4.9,
    reviews: 67,
    stock: 8,
    badges: ['Ultra Premium', 'Limitado'],
    descripcion: 'Trufa negra mexicana fresca de temporada limitada. Aroma y sabor intensos para alta cocina.',
    storytelling: 'El diamante negro de los bosques mexicanos',
    metricas: {
      co2: '0.8 kg CO₂',
      agua: '25L agua',
      plastico: '3g plástico evitado'
    }
  },
  {
    id: 'caviar-vegano-algas-50g',
    nombre: 'Caviar Vegano de Algas',
    precio: 165.00,
    unidad: '50g',
    imagen: '/products/caviar-vegano-algas.jpg',
    productor: 'Delicias Marinas Veganas',
    ubicacion: 'Baja California, México',
    categoria: 'otros',
    rating: 4.7,
    reviews: 98,
    stock: 20,
    badges: ['100% Vegano', 'Textura Auténtica'],
    descripcion: 'Caviar vegano elaborado con algas marinas. Textura y sabor que imita perfectamente al caviar.',
    storytelling: 'La elegancia del mar sin daño alguno',
    metricas: {
      co2: '1.2 kg CO₂ capturado',
      agua: '12L agua',
      plastico: '8g plástico evitado'
    }
  },
  
  // CERVEZAS Y BEBIDAS FERMENTADAS ARTESANALES
  {
    id: 'tepache-artesanal-500ml',
    nombre: 'Tepache Artesanal de Piña',
    precio: 65.00,
    unidad: '500ml',
    imagen: '/products/tepache-artesanal.jpg',
    productor: 'Fermentos Tradicionales',
    ubicacion: 'Jalisco, México',
    categoria: 'bebidas',
    rating: 4.8,
    reviews: 234,
    stock: 50,
    badges: ['Fermentado Natural', 'Receta Tradicional'],
    descripcion: 'Tepache artesanal fermentado naturalmente con piña, canela y piloncillo. Bebida tradicional mexicana.',
    storytelling: 'La refrescante tradición fermentada de México',
    metricas: {
      co2: '1.5 kg CO₂',
      agua: '28L agua',
      plastico: '20g plástico evitado'
    }
  },
  {
    id: 'pulque-curado-fresa-400ml',
    nombre: 'Pulque Curado de Fresa',
    precio: 85.00,
    unidad: '400ml',
    imagen: '/products/pulque-curado-fresa.jpg',
    productor: 'Pulquería Tradicional',
    ubicacion: 'Hidalgo, México',
    categoria: 'bebidas',
    rating: 4.6,
    reviews: 156,
    stock: 25,
    badges: ['Bebida Ancestral', 'Probióticos Vivos'],
    descripcion: 'Pulque curado con fresa natural. Bebida ancestral mexicana rica en probióticos y nutrientes.',
    storytelling: 'El néctar sagrado de los antiguos mexicanos',
    metricas: {
      co2: '1.8 kg CO₂',
      agua: '45L agua',
      plastico: '18g plástico evitado'
    }
  },
  
  // ESPECIAS INTERNACIONALES
  {
    id: 'azafran-importado-1g',
    nombre: 'Azafrán Import. La Mancha',
    precio: 225.00,
    unidad: '1g',
    imagen: '/products/azafran-importado.jpg',
    productor: 'Especias del Mundo',
    ubicacion: 'La Mancha, España (Import.)',
    categoria: 'especias',
    rating: 4.9,
    reviews: 89,
    stock: 15,
    badges: ['DOP La Mancha', 'Oro Rojo'],
    descripcion: 'Azafrán de La Mancha DOP, la especia más cara del mundo. Aroma y sabor inigualables.',
    storytelling: 'El oro rojo que transformó la gastronomía mundial',
    metricas: {
      co2: '2.5 kg CO₂',
      agua: '15L agua',
      plastico: '2g plástico evitado'
    }
  },
  {
    id: 'vainilla-madagascar-2vainas',
    nombre: 'Vainilla de Madagascar',
    precio: 185.00,
    unidad: '2 vainas',
    imagen: '/products/vainilla-madagascar.jpg',
    productor: 'Especias Premium Import.',
    ubicacion: 'Madagascar (Importado)',
    categoria: 'especias',
    rating: 4.8,
    reviews: 145,
    stock: 30,
    badges: ['Grado A', 'Bourbon Premium'],
    descripcion: 'Vainas de vainilla de Madagascar grado A. Aroma intenso y cremoso, ideal para repostería gourmet.',
    storytelling: 'La reina de los aromas desde el Índico',
    metricas: {
      co2: '4.2 kg CO₂',
      agua: '85L agua',
      plastico: '5g plástico evitado'
    }
  },
  
  // ENDULZANTES EXOTICOS
  {
    id: 'jarabe-yacon-250ml',
    nombre: 'Jarabe de Yacón',
    precio: 145.00,
    unidad: '250ml',
    imagen: '/products/jarabe-yacon.jpg',
    productor: 'Endulzantes Andinos',
    ubicacion: 'Perú (Importado)',
    categoria: 'endulzantes',
    rating: 4.7,
    reviews: 134,
    stock: 35,
    badges: ['Bajo Índice Glicémico', 'Prebiótico'],
    descripcion: 'Jarabe de yacón andino con bajo índice glicémico. Endulzante natural prebiótico.',
    storytelling: 'La dulzura saludable de los Andes',
    metricas: {
      co2: '3.8 kg CO₂',
      agua: '75L agua',
      plastico: '15g plástico evitado'
    }
  },
  {
    id: 'stevia-liquida-concentrada-50ml',
    nombre: 'Stevia Líquida Concentrada',
    precio: 85.00,
    unidad: '50ml',
    imagen: '/products/stevia-liquida.jpg',
    productor: 'Endulzantes Naturales México',
    ubicacion: 'Jalisco, México',
    categoria: 'endulzantes',
    rating: 4.6,
    reviews: 198,
    stock: 65,
    badges: ['Cero Calorías', 'Extracto Puro'],
    descripcion: 'Stevia líquida concentrada sin calorías. Extracto puro de hojas de stevia mexicana.',
    storytelling: 'La dulzura verde sin consecuencias',
    metricas: {
      co2: '0.8 kg CO₂',
      agua: '12L agua',
      plastico: '8g plástico evitado'
    }
  },
  
  // PRODUCTOS REGIONALES ESPECIALES
  {
    id: 'sal-rosa-himalaya-500g',
    nombre: 'Sal Rosa del Himalaya',
    precio: 95.00,
    unidad: '500g',
    imagen: '/products/sal-rosa-himalaya.jpg',
    productor: 'Sales del Mundo',
    ubicacion: 'Pakistán (Importado)',
    categoria: 'condimentos',
    rating: 4.8,
    reviews: 267,
    stock: 55,
    badges: ['84 Minerales', 'Cristales Puros'],
    descripcion: 'Sal rosa del Himalaya con 84 minerales naturales. Cristales puros extraidos de minas ancestrales.',
    storytelling: 'Los cristales rosados de las montañas sagradas',
    metricas: {
      co2: '5.2 kg CO₂',
      agua: '35L agua',
      plastico: '12g plástico evitado'
    }
  },
  {
    id: 'flor-sal-guerrero-250g',
    nombre: 'Flor de Sal de Guerrero',
    precio: 125.00,
    unidad: '250g',
    imagen: '/products/flor-sal-guerrero.jpg',
    productor: 'Salineras Artesanales del Pacífico',
    ubicacion: 'Guerrero, México',
    categoria: 'condimentos',
    rating: 4.9,
    reviews: 156,
    stock: 25,
    badges: ['Artesanal', 'Cosecha Manual'],
    descripcion: 'Flor de sal artesanal cosechada manualmente en las costas de Guerrero. Textura crujiente única.',
    storytelling: 'Las flores blancas que regala el Pacífico mexicano',
    metricas: {
      co2: '1.8 kg CO₂',
      agua: '25L agua',
      plastico: '8g plástico evitado'
    }
  },
  
  // PRODUCTOS DE TEMPORADA ESPECIALES
  {
    id: 'chile-en-nogada-kit-4porciones',
    nombre: 'Kit Chiles en Nogada',
    precio: 485.00,
    unidad: '4 porciones',
    imagen: '/products/kit-chiles-nogada.jpg',
    productor: 'Cocina Tradicional Poblana',
    ubicacion: 'Puebla, México',
    categoria: 'otros',
    rating: 4.9,
    reviews: 189,
    stock: 12,
    badges: ['Temporada Limitada', 'Platillo Patrio'],
    descripcion: 'Kit completo para chiles en nogada: chiles poblanos, nogada fresca, granada y todos los ingredientes.',
    storytelling: 'Los colores de la bandera en el platillo más mexicano',
    metricas: {
      co2: '8.5 kg CO₂',
      agua: '185L agua',
      plastico: '45g plástico evitado'
    }
  },
  {
    id: 'mole-poblano-premium-500g',
    nombre: 'Mole Poblano Premium',
    precio: 285.00,
    unidad: '500g',
    imagen: '/products/mole-poblano-premium.jpg',
    productor: 'Moles Tradicionales de Puebla',
    ubicacion: 'Puebla, México',
    categoria: 'condimentos',
    rating: 4.9,
    reviews: 298,
    stock: 35,
    badges: ['30 Ingredientes', 'Receta Conventual'],
    descripcion: 'Mole poblano premium con 30 ingredientes. Receta conventual del siglo XVII de Santa Rosa.',
    storytelling: 'El sabor barroco que conquistó al mundo',
    metricas: {
      co2: '6.5 kg CO₂',
      agua: '125L agua',
      plastico: '25g plástico evitado'
    }
  },
  
  // POSTRES Y DULCES ARTESANALES
  {
    id: 'ate-membrillo-casero-300g',
    nombre: 'Ate de Membrillo Casero',
    precio: 75.00,
    unidad: '300g',
    imagen: '/products/ate-membrillo-casero.jpg',
    productor: 'Dulces Tradicionales',
    ubicacion: 'Michoacán, México',
    categoria: 'endulzantes',
    rating: 4.7,
    reviews: 167,
    stock: 45,
    badges: ['Receta Casera', 'Sin Conservadores'],
    descripcion: 'Ate de membrillo elaborado con receta casera tradicional. Sin conservadores ni colorantes artificiales.',
    storytelling: 'El dulce cristalino de las cocinas de antao',
    metricas: {
      co2: '2.2 kg CO₂',
      agua: '45L agua',
      plastico: '15g plástico evitado'
    }
  },
  {
    id: 'cocada-coco-fresco-200g',
    nombre: 'Cocada de Coco Fresco',
    precio: 95.00,
    unidad: '200g',
    imagen: '/products/cocada-coco-fresco.jpg',
    productor: 'Dulcería Tropical',
    ubicacion: 'Colima, México',
    categoria: 'endulzantes',
    rating: 4.8,
    reviews: 198,
    stock: 30,
    badges: ['Coco Fresco', 'Textura Perfecta'],
    descripcion: 'Cocada artesanal elaborada con coco fresco recén rallado. Textura suave y sabor intenso.',
    storytelling: 'El paraíso tropical en cada bocado dulce',
    metricas: {
      co2: '2.8 kg CO₂',
      agua: '65L agua',
      plastico: '12g plástico evitado'
    }
  },
  
  // KITS Y CANASTAS ESPECIALES
  {
    id: 'kit-tacos-gourmet-familia-8pax',
    nombre: 'Kit Tacos Gourmet Familiar',
    precio: 485.00,
    unidad: '8 porciones',
    imagen: '/products/kit-tacos-gourmet.jpg',
    productor: 'Experiencias Culinarias México',
    ubicacion: 'Ciudad de México',
    categoria: 'canastas',
    rating: 4.9,
    reviews: 234,
    stock: 15,
    badges: ['Kit Completo', 'Experiencia Familiar'],
    descripcion: 'Kit completo para tacos gourmet familiares: tortillas artesanales, carnes premium, salsas y acompañamientos.',
    storytelling: 'La experiencia taquera gourmet en tu hogar',
    metricas: {
      co2: '12.5 kg CO₂',
      agua: '285L agua',
      plastico: '85g plástico evitado'
    }
  },
  {
    id: 'canasta-degustacion-quesos-6tipos',
    nombre: 'Canasta Degustación de Quesos',
    precio: 385.00,
    unidad: '6 tipos',
    imagen: '/products/canasta-degustacion-quesos.jpg',
    productor: 'Quesos Artesanales de México',
    ubicacion: 'Varios Estados',
    categoria: 'canastas',
    rating: 4.8,
    reviews: 145,
    stock: 20,
    badges: ['6 Variedades', 'Maridaje Incluido'],
    descripcion: 'Canasta con 6 tipos de quesos artesanales mexicanos. Incluye guía de maridaje y notas de cata.',
    storytelling: 'Un viaje por los sabores queseros de México',
    metricas: {
      co2: '15.2 kg CO₂',
      agua: '245L agua',
      plastico: '65g plástico evitado'
    }
  },
  
  // PRODUCTOS FINALES ESPECIALES
  {
    id: 'elixir-juventud-colageno-250ml',
    nombre: 'Elixir Juventud Colágeno Marino',
    precio: 325.00,
    unidad: '250ml',
    imagen: '/products/elixir-juventud-colageno.jpg',
    productor: 'Nutracéuticos Marinos',
    ubicacion: 'Baja California, México',
    categoria: 'otros',
    rating: 4.7,
    reviews: 89,
    stock: 25,
    badges: ['Colágeno Marino', 'Anti-edad'],
    descripcion: 'Elixir de colágeno marino hidrolizado con vitaminas y antioxidantes. Fórmula anti-edad natural.',
    storytelling: 'El secreto de la juventud desde las profundidades',
    metricas: {
      co2: '4.5 kg CO₂ capturado',
      agua: '85L agua',
      plastico: '18g plástico evitado'
    }
  },
  {
    id: 'regalo-experiencia-huerto-urbano',
    nombre: 'Experiencia Huerto Urbano Completo',
    precio: 485.00,
    unidad: '1 kit',
    imagen: '/products/regalo-huerto-urbano-completo.jpg',
    productor: 'Huertos en Casa',
    ubicacion: 'Estado de México',
    categoria: 'otros',
    rating: 4.9,
    reviews: 198,
    stock: 15,
    badges: ['Kit Completo', 'Experiencia Única'],
    descripcion: 'Kit completo para crear huerto urbano: macetas, sustratos, semillas, herramientas y guía paso a paso.',
    storytelling: 'Cultiva tu propio futuro verde desde casa',
    metricas: {
      co2: '8.5 kg CO₂ capturado',
      agua: '125L agua',
      plastico: '95g plástico evitado'
    }
  }
];

// Los productos de queso fresco y salsa molcajeteada fueron eliminados por solicitud del usuario

// Función para cargar los datos desde el CSV
export async function cargarProductosDesdeCSV() {
  // TEMPORAL: Siempre devolver los datos del catálogo mientras migramos a PostgreSQL
  // Esto evita los errores de parseo del CSV
  console.log('Usando datos del catálogo completo mientras migramos a PostgreSQL');
  return productos;
  
  /* 
  // CÓDIGO ORIGINAL - Comentado temporalmente
  // Verificar si estamos en el servidor
  if (typeof window === 'undefined') {
    try {
      // Solo en el servidor podemos importar dinámicamente
      const { cargarProductosCSV, convertirAProductos } = await import('../utils/csv-loader');
      const productosCSV = cargarProductosCSV();
      const productosConvertidos = convertirAProductos(productosCSV);
      
      if (productosConvertidos && productosConvertidos.length > 0) {
        console.log(`Cargados ${productosConvertidos.length} productos desde CSV`);
        productos = productosConvertidos;
        return productosConvertidos;
      } else {
        console.warn('No se pudieron cargar productos desde CSV. Usando datos de fallback.');
        return productosFallback;
      }
    } catch (error) {
      console.error('Error al cargar productos desde CSV:', error);
      return productosFallback;
    }
  }
  
  return productos;
  */
}
