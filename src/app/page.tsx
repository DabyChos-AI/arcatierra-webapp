'use client';

import React, { useState, useEffect } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Link from 'next/link';
import { CheckCircle, Users, Leaf, Heart, ShoppingCart, Calendar, Phone, MapPin, ArrowRight, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Importamos productos desde el módulo de datos
import { productos } from '@/data/productos';

// Datos de métricas de ejemplo
const metricas = {
  familiasBeneficiadas: 120,
  co2Ahorrado: "2.5 ton",
  aguaAhorrada: "750K L",
  productoresRed: 25
};

// Experiencias destacadas como datos de ejemplo
const experienciasDestacadas = [
  {
    id: 'taller-cocina',
    titulo: 'Taller de Cocina Tradicional',
    imagen: '/images/experiencias/experiencias_arca_tierra.jpg',
    fecha: '15 de Julio, 2025',
    ubicacion: 'Xochimilco, CDMX',
    precio: 450,
    cupo: 12
  },
  {
    id: 'visita-chinampas',
    titulo: 'Visita Guiada a Chinampas',
    imagen: '/images/experiencias/experiencias_chinampa_del_sol.jpg',
    fecha: '22 de Julio, 2025',
    ubicacion: 'Xochimilco, CDMX',
    precio: 380,
    cupo: 20
  },
  {
    id: 'cata-mezcal',
    titulo: 'Cata de Mezcal Artesanal',
    imagen: '/images/experiencias/turismo_rural_xochimilco.jpg',
    fecha: '5 de Agosto, 2025',
    ubicacion: 'Centro Histórico, CDMX',
    precio: 650,
    cupo: 15
  }
];

// Página de inicio
export default function HomePage() {
  // Estado para favoritos
  const [favoritos, setFavoritos] = useState<string[]>([]);
  
  // Estado para carrito
  const [carrito, setCarrito] = useState<{
    id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    tipo: 'producto' | 'experiencia';
    modo?: 'suscripcion' | 'unico';
  }[]>([]);

  // Cargar favoritos desde localStorage al inicio
  useEffect(() => {
    const favoritosGuardados = localStorage.getItem('arcaTierraFavoritos');
    if (favoritosGuardados) {
      setFavoritos(JSON.parse(favoritosGuardados));
    }

    const carritoGuardado = localStorage.getItem('arcaTierraCarrito');
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }
  }, []);

  // Función para alternar favoritos
  const toggleFavorito = (id: string) => {
    const nuevosFavoritos = favoritos.includes(id)
      ? favoritos.filter(favId => favId !== id)
      : [...favoritos, id];
    
    setFavoritos(nuevosFavoritos);
    localStorage.setItem('arcaTierraFavoritos', JSON.stringify(nuevosFavoritos));
  };

  // Función para agregar al carrito
  const agregarAlCarrito = (
    id: string,
    nombre: string,
    precio: number,
    tipo: 'producto' | 'experiencia',
    modo?: 'suscripcion' | 'unico'
  ) => {
    // Verificar si ya existe en el carrito
    const itemExistente = carrito.find(item => item.id === id && item.modo === modo);
    
    let nuevoCarrito;
    if (itemExistente) {
      // Incrementar cantidad
      nuevoCarrito = carrito.map(item => 
        (item.id === id && item.modo === modo) 
          ? {...item, cantidad: item.cantidad + 1} 
          : item
      );
    } else {
      // Añadir nuevo item
      nuevoCarrito = [
        ...carrito, 
        {
          id,
          nombre,
          precio,
          cantidad: 1,
          tipo,
          modo
        }
      ];
    }

    setCarrito(nuevoCarrito);
    localStorage.setItem('arcaTierraCarrito', JSON.stringify(nuevoCarrito));
  };

  return (
    <>
      <main className="min-h-screen">
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-[url('/images/home/chinampas_xochimilco.png')] bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
                <Leaf className="h-5 w-5 text-green-400" />
                <span className="text-white font-medium">Desde 2009 regenerando el campo mexicano</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-tight">
                Arca Tierra,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  alimentos mexicanos naturales
                </span>{' '}
                a tu mesa
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                Somos una red local que promueve la buena alimentación a través de productos agroecológicos mexicanos.
                Conectamos directamente a familias campesinas con tu mesa.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/tienda">
                  <Button size="lg" className="bg-terracota hover:bg-terracota-dark text-white px-8 py-6 text-lg font-semibold group">
                    <span>Explorar Canastas</span>
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/experiencias">
                  <Button size="lg" variant="outline" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 px-8 py-6 text-lg font-semibold">
                    Ver Experiencias
                  </Button>
                </Link>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                  <div className="flex justify-center mb-2">
                    <Users className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {metricas.familiasBeneficiadas}+
                  </div>
                  <div className="text-sm text-gray-300">Familias beneficiadas</div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                  <div className="flex justify-center mb-2">
                    <Leaf className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {metricas.co2Ahorrado}
                  </div>
                  <div className="text-sm text-gray-300">CO₂ ahorrado</div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                  <div className="flex justify-center mb-2">
                    <Droplets className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {metricas.aguaAhorrada}
                  </div>
                  <div className="text-sm text-gray-300">Agua ahorrada</div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                  <div className="flex justify-center mb-2">
                    <div className="h-8 w-8 bg-terracota rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{metricas.productoresRed}</span>
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {metricas.productoresRed}
                  </div>
                  <div className="text-sm text-gray-300">Productores en red</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce" />
            </div>
          </div>
        </section>

        {/* CANASTAS / PRODUCTOS DESTACADOS */}
        <section id="canastas" className="py-20 bg-neutro-claro">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                Canastas Agroecológicas
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Recibe en tu hogar una selección de vegetales frescos y frutas de temporada, 
                cultivados por nuestra red de productores comprometidos con la agricultura regenerativa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {productos.slice(0, 3).map((producto, index) => (
                <Card key={producto.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all group">
                  <div className="relative overflow-hidden pt-[56.25%]">
                    <div className="absolute inset-0 bg-gray-200">
                      {producto.imagen && (
                        <OptimizedImage 
                          src={producto.imagen || '/products/placeholder.jpg'}
                          alt={producto.nombre}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {producto.badges && producto.badges.map((badge, i) => (
                        <span key={i} className="bg-verde text-white px-3 py-1 rounded-full text-xs font-medium">
                          {badge}
                        </span>
                      ))}
                    </div>
                    
                    {/* Botón Favorito */}
                    <button
                      onClick={() => toggleFavorito(producto.id)}
                      className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    >
                      <Heart 
                        className={`w-5 h-5 ${favoritos.includes(producto.id) ? 'fill-terracota text-terracota' : 'text-gray-500'}`} 
                      />
                    </button>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{producto.nombre}</h3>
                    
                    {/* Productor y ubicación */}
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="mr-3">{producto.productor}</span>
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{producto.ubicacion}</span>
                    </div>
                    
                    {/* Precio */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold text-terracota">
                          ${producto.precio.toFixed(2)} <span className="text-sm font-medium">/ {producto.unidad}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Métricas de impacto */}
                    <div className="grid grid-cols-3 gap-2 mb-6 p-3 bg-green-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-verde">{producto.metricas?.co2 || "0.5kg CO₂"}</div>
                        <div className="text-xs text-gray-600">CO₂ ahorrado</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-verde">{producto.metricas?.agua || "25L"}</div>
                        <div className="text-xs text-gray-600">Agua</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-verde">{producto.metricas?.plastico || "30g"}</div>
                        <div className="text-xs text-gray-600">Plástico</div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => agregarAlCarrito(producto.id, producto.nombre, producto.precio, 'producto', 'suscripcion')}
                        className="flex-1 bg-terracota hover:bg-terracota-oscuro text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                      >
                        Suscribirse
                      </button>
                      <button 
                        onClick={() => agregarAlCarrito(producto.id, producto.nombre, producto.precio, 'producto', 'unico')}
                        className="flex-1 border border-terracota text-terracota hover:bg-terracota hover:text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                      >
                        Compra única
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link href="/tienda">
                <Button variant="outline" className="border-terracota text-terracota hover:bg-terracota hover:text-white px-6 py-3">
                  Ver todos los productos
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* EXPERIENCIAS */}
        <section id="experiencias" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                Experiencias
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Aprende, conecta y vive experiencias únicas relacionadas con la 
                gastronomía mexicana y la agricultura sustentable.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {experienciasDestacadas.map(exp => (
                <Card key={exp.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all group">
                  <div className="relative overflow-hidden pt-[75%]">
                    <div className="absolute inset-0 bg-gray-200">
                      <div className="w-full h-full bg-[url('/images/experiencia1.jpg')] bg-cover bg-center"></div>
                    </div>
                    
                    {/* Botón Favorito */}
                    <button
                      onClick={() => toggleFavorito(exp.id)}
                      className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    >
                      <Heart 
                        className={`w-5 h-5 ${favoritos.includes(exp.id) ? 'fill-terracota text-terracota' : 'text-gray-500'}`} 
                      />
                    </button>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="text-terracota font-semibold mb-2">{exp.fecha}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{exp.titulo}</h3>
                    
                    <div className="flex items-center text-gray-500 text-sm mb-4">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{exp.ubicacion}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xl font-bold text-terracota">
                        ${exp.precio.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Cupo: {exp.cupo} personas
                      </div>
                    </div>
                    
                    <button
                      onClick={() => agregarAlCarrito(exp.id, exp.titulo, exp.precio, 'experiencia')}
                      className="w-full bg-terracota hover:bg-terracota-oscuro text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                      Reservar lugar
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link href="/experiencias">
                <Button variant="outline" className="border-terracota text-terracota hover:bg-terracota hover:text-white px-6 py-3">
                  Ver todas las experiencias
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* PROPUESTA DE VALOR / BANDERAS */}
        <section className="py-20 bg-neutro-claro">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-16 text-center">
              Sembramos un futuro abundante
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-md text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-verde" />
                </div>
                <h3 className="text-xl font-bold mb-2">Agroecología</h3>
                <p className="text-gray-600">
                  Alimentos cultivados en armonía con la naturaleza, sin pesticidas ni transgénicos.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-md text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-verde" />
                </div>
                <h3 className="text-xl font-bold mb-2">Impacto social</h3>
                <p className="text-gray-600">
                  Comercio justo que dignifica el trabajo de pequeños productores mexicanos.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-md text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-verde" />
                </div>
                <h3 className="text-xl font-bold mb-2">Calidad garantizada</h3>
                <p className="text-gray-600">
                  Productos frescos seleccionados bajo estrictos estándares de calidad.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-md text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-verde" />
                </div>
                <h3 className="text-xl font-bold mb-2">Soporte personal</h3>
                <p className="text-gray-600">
                  Te acompañamos en cada paso para disfrutar de tus productos y experiencias.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA FINAL */}
        <section className="py-20 bg-verde text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold mb-6">
              Únete a nuestra comunidad
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto">
              Conéctate con productores locales, participa en experiencias únicas y 
              disfruta de alimentos frescos cultivados de manera sustentable.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/tienda">
                <Button size="lg" className="bg-white text-verde hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                  <ShoppingCart className="mr-2 h-5 w-5" /> Explorar Tienda
                </Button>
              </Link>
              <Link href="/nosotros">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-verde px-8 py-6 text-lg font-semibold">
                  Conoce Más
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
