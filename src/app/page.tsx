'use client';

import React, { useState, useEffect } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Link from 'next/link';
import { CheckCircle, Users, Leaf, Heart, ShoppingCart, Calendar, Phone, MapPin, ArrowRight, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Importamos productos y experiencias desde los módulos de datos
import { productos } from '@/data/productos';
import { experiencias } from '@/data/experiencias';
import ExperienceCard from '@/components/ExperienceCard';

// Datos de métricas de ejemplo
const metricas = {
  familiasBeneficiadas: 120,
  co2Ahorrado: "2.5 ton",
  aguaAhorrada: "750K L",
  productoresRed: 25
};

// Obtener las 4 primeras experiencias públicas de los datos actualizados
const experienciasDestacadas = experiencias
  .filter(exp => exp.tipo === 'publica')
  .slice(0, 4);

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
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
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
                <span className="text-amber-200">
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
                <Link href="/suscripciones">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  id: 'individual',
                  name: 'Canasta Individual',
                  description: 'Perfecta para personas solteras o parejas',
                  price: 290,
                  items: '1-2 personas',
                  weight: '3.5 kg',
                  image: '/images/canastas/canasta-individual.jpg',
                  features: ['Variedad balanceada de nutrientes', 'Fácil de consumir en una semana', 'Incluye fruta y verduras de temporada'],
                  popular: true
                },
                {
                  id: 'media',
                  name: 'Canasta Media',
                  description: 'Equilibrio perfecto entre variedad y cantidad',
                  price: 350,
                  items: '2-3 personas',
                  weight: '5 kg',
                  image: '/images/canastas/canasta-familiar.jpg',
                  features: ['Incluye frutas y verduras de temporada', 'Ideal para familias pequeñas', 'Excelente relación calidad-precio'],
                  popular: true
                },
                {
                  id: 'completa',
                  name: 'Canasta Completa',
                  description: 'Variedad amplia con productos especiales',
                  price: 510,
                  items: '3-4 personas',
                  weight: '7.5 kg',
                  image: '/images/canastas/canasta-premium.jpg',
                  features: ['Variedad amplia de productos', 'Perfecta para familias medianas', 'Mayor diversidad nutricional'],
                  popular: false
                },
                {
                  id: 'familiar',
                  name: 'Canasta Familiar',
                  description: 'La opción más popular para familias grandes',
                  price: 670,
                  items: '4-6 personas',
                  weight: '10 kg',
                  image: '/images/canastas/canasta-familiar.jpg',
                  features: ['La opción más popular para familias grandes', 'Abundante variedad de alimentos agroecológicos', 'Mejor relación precio-calidad por kilogramo'],
                  popular: true,
                  masPopular: true,
                  masBarata: true,
                  precioKg: 67
                }
              ].map((canasta) => (
                <Card key={canasta.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all group">
                  <div className="relative overflow-hidden pt-[56.25%]">
                    <div className="absolute inset-0 bg-gray-200">
                      <OptimizedImage 
                        src={canasta.image}
                        alt={canasta.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    
                    {/* Sin badges en la imagen - todos se moverán al contenido de la tarjeta */}
                  </div>
                  
                  <CardContent className="p-6">
                    {/* Badges movidos desde la imagen hacia el contenido de la tarjeta */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {canasta.masPopular && (
                        <span className="bg-terracota text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          ⭐ Más Popular
                        </span>
                      )}
                      {canasta.popular && !canasta.masPopular && (
                        <span className="bg-terracota text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          🔥 Popular
                        </span>
                      )}
                      {canasta.masBarata && (
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          💚 Más barata ${canasta.precioKg}/kg
                        </span>
                      )}
                      <span className="bg-verde text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        🌱 Alimentos Agroecológicos
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{canasta.name}</h3>
                    <p className="text-gray-600 mb-4">{canasta.description}</p>
                    
                    {/* Precio */}
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-terracota mb-1">
                        ${canasta.price}
                      </div>
                      <p className="text-sm text-gray-500">por entrega</p>
                    </div>
                    
                    {/* Detalles */}
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Productos:</span>
                        <span className="font-medium">{canasta.items}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Peso aprox:</span>
                        <span className="font-medium">{canasta.weight}</span>
                      </div>
                    </div>

                    {/* Características */}
                    <ul className="space-y-1 mb-6">
                      {canasta.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-verde rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Botones de acción */}
                    <div className="flex flex-col space-y-3">
                      <Link href="/suscripciones">
                        <Button className="w-full bg-terracota hover:bg-terracota-dark text-white py-3 font-semibold transition-colors">
                          Suscripción Semanal
                        </Button>
                      </Link>
                      <Button 
                        onClick={() => {
                          // Verificar que estamos en el cliente antes de usar localStorage/window
                          if (typeof window === 'undefined') return;
                          
                          try {
                            // Agregar canasta al carrito
                            const carritoActual = JSON.parse(localStorage.getItem('arcaTierraCart') || '[]');
                            const nuevaCanasta = {
                              id: `canasta-${canasta.id}`,
                              name: canasta.name,
                              price: canasta.price,
                              unit: 'compra única',
                              tipo: 'canasta',
                              image: canasta.image,
                              description: canasta.description,
                              quantity: 1
                            };
                            
                            // Verificar si ya existe en el carrito
                            const existeIndex = carritoActual.findIndex((item: any) => item.id === nuevaCanasta.id);
                            if (existeIndex >= 0) {
                              carritoActual[existeIndex].quantity += 1;
                            } else {
                              carritoActual.push(nuevaCanasta);
                            }
                            
                            localStorage.setItem('arcaTierraCart', JSON.stringify(carritoActual));
                            // Disparar evento para actualizar el contador del carrito
                            window.dispatchEvent(new Event('cartUpdated'));
                            
                            console.log('Canasta agregada al carrito:', nuevaCanasta.name);
                          } catch (error) {
                            console.error('Error al agregar al carrito:', error);
                          }
                        }}
                        variant="outline" 
                        className="w-full border-terracota text-terracota hover:bg-terracota hover:text-white py-3 font-semibold transition-colors"
                      >
                        Agregar al Carrito
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link href="/suscripciones">
                <Button variant="outline" className="border-terracota text-terracota hover:bg-terracota hover:text-white px-6 py-3">
                  Ver todas las canastas
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
              {experienciasDestacadas.map((exp, index) => (
                <ExperienceCard key={exp.id} experiencia={exp} index={index} />
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
            <h2 className="text-4xl font-bold mb-6 text-amber-200">
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
