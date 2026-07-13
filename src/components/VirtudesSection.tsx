'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Leaf, 
  Users, 
  ChefHat, 
  TreePine, 
  Droplets, 
  Heart, 
  HandCoins, 
  Recycle,
  LucideIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { virtudes } from '@/data/virtudes';

// Mapeo de nombres de iconos a componentes
const iconMap: Record<string, LucideIcon> = {
  Leaf,
  Users,
  ChefHat,
  TreePine,
  Droplets,
  Heart,
  HandCoins,
  Recycle
};

export default function VirtudesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-neutro-claro">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Valores que nos mueven
          </h2>
        </div>

        {/* Grid de virtudes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {virtudes.map((virtud) => {
            const IconComponent = iconMap[virtud.icon];
            
            return (
              <div 
                key={virtud.id}
                className="
                  bg-white p-8 rounded-xl shadow-md 
                  hover:shadow-xl hover:-translate-y-1
                  transition-all duration-300
                  text-center
                "
              >
                {/* Icon */}
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {IconComponent && <IconComponent className="w-8 h-8 text-verde" />}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold mb-3 text-gray-900 leading-tight">
                  {virtud.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {virtud.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-2xl font-semibold text-terracota mb-6">
            Empieza tu suscripción
          </p>
          <Link href="/suscripciones">
            <Button 
              size="lg" 
              className="bg-terracota hover:bg-terracota-dark text-white px-8 py-6 text-lg font-semibold"
            >
              Ver planes de suscripción
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
