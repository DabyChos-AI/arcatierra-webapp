import { motion } from 'framer-motion';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Link from 'next/link';
import { FC } from 'react';

interface ExperienceCardProps {
  title: string;
  description: string;
  imageSrc: string;
  price: number;
  category: string;
  slug: string;
}

const ExperienceCard: FC<ExperienceCardProps> = ({ 
  title, 
  description, 
  imageSrc, 
  price, 
  category, 
  slug 
}) => {
  return (
    <motion.div 
      className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-shadow duration-500"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: '-50px' }}
    >
      {/* Imagen con hover effect */}
      <div className="aspect-[16/9] w-full overflow-hidden rounded-t-2xl">
        <div className="relative h-full w-full transform transition-transform duration-700 group-hover:scale-105">
          {imageSrc ? (
            <OptimizedImage 
              src={imageSrc} 
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gris-claro text-gris-oscuro">
              <span>Imagen no disponible</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-negro/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
      
      {/* Categoría */}
      <div className="absolute top-4 left-4 bg-terracota-principal/90 text-white text-xs font-medium px-3 py-1.5 rounded-full">
        {category}
      </div>
      
      {/* Contenido */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-verde-principal line-clamp-2 mb-2 font-heading group-hover:text-terracota-principal transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-gris-oscuro line-clamp-3 mb-4">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-verde-principal">
            ${typeof price === 'number' ? price.toFixed(2) : price} <span className="text-sm font-normal">MXN</span>
          </span>
          <Link href={`/experiencias/${slug}`}>
            <motion.button 
              className="bg-verde-principal text-white rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 group-hover:bg-terracota-principal"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reservar
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ExperienceCard;
