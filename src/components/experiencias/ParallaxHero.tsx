import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { FC } from 'react';

interface ParallaxHeroProps {
  title: string;
  subtitle?: string;
  imageSrc: string;
  height?: string;
}

const ParallaxHero: FC<ParallaxHeroProps> = ({
  title,
  subtitle,
  imageSrc,
  height = "80vh"
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);
  const textY = useTransform(scrollY, [0, 300], [0, -50]);

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      {/* Imagen de fondo con efecto parallax */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        style={{ y, scale }}
      >
        <Image
          src={imageSrc}
          alt={title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-negro/70 to-transparent" />
      </motion.div>

      {/* Contenido superpuesto */}
      <motion.div 
        className="relative z-10 container mx-auto h-full flex flex-col items-center justify-center px-4 text-center"
        style={{ y: textY, opacity }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-4 drop-shadow-lg"
        >
          {title}
        </motion.h1>
        
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-white max-w-2xl drop-shadow-md"
          >
            {subtitle}
          </motion.p>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-terracota-principal hover:bg-terracota-principal/90 text-white px-8 py-3 rounded-full font-medium text-lg transition-all duration-300 shadow-lg"
          >
            Explorar experiencias
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ParallaxHero;
