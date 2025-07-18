import React from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';

// Componente para el encabezado
interface HeaderProps {
  title: string;
  subtitle: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-8">
      <div className="inline-block px-4 py-1 bg-amber-100 text-amber-800 rounded-full mb-3">
        {title}
      </div>
      <h1 className="text-4xl font-bold text-gray-800">{subtitle}</h1>
    </div>
  );
};

// Componente para la descripción principal
interface DescriptionProps {
  text: string;
}

const Description: React.FC<DescriptionProps> = ({ text }) => {
  return (
    <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
      {text}
    </p>
  );
};

// Componente para la imagen principal
interface MainImageProps {
  src: string;
  alt: string;
}

const MainImage: React.FC<MainImageProps> = ({ src, alt }) => {
  return (
    <div className="rounded-lg overflow-hidden shadow-lg mb-12">
      <OptimizedImage 
        src={src} 
        alt={alt} 
        width={800} 
        height={500} 
        className="w-full h-auto object-cover" 
      />
    </div>
  );
};

// Componente para el título de beneficios
interface BenefitsSectionTitleProps {
  title: string;
}

const BenefitsSectionTitle: React.FC<BenefitsSectionTitleProps> = ({ title }) => {
  return (
    <h2 className="text-2xl font-bold text-gray-800 mb-8">{title}</h2>
  );
};

// Componente para cada tarjeta de beneficio
interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md flex items-start gap-4">
      <div className="bg-gray-100 rounded-full p-2">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

// Componente para la sección de beneficios
interface BenefitsSectionProps {
  title: string;
  benefits: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
}

const BenefitsSection: React.FC<BenefitsSectionProps> = ({ title, benefits }) => {
  return (
    <div className="mb-12">
      <BenefitsSectionTitle title={title} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => (
          <BenefitCard 
            key={index} 
            icon={benefit.icon} 
            title={benefit.title} 
            description={benefit.description} 
          />
        ))}
      </div>
    </div>
  );
};

// Componente para las tarjetas de imagen
interface ImageCardProps {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ src, alt, title, subtitle }) => {
  return (
    <div className="relative rounded-lg overflow-hidden shadow-md h-64">
      <OptimizedImage 
        src={src} 
        alt={alt} 
        fill 
        className="object-cover" 
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-800 to-transparent p-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-200">{subtitle}</p>
      </div>
    </div>
  );
};

// Componente para la sección de tarjetas de imagen
interface ImageCardsSectionProps {
  cards: {
    src: string;
    alt: string;
    title: string;
    subtitle: string;
  }[];
}

const ImageCardsSection: React.FC<ImageCardsSectionProps> = ({ cards }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
      {cards.map((card, index) => (
        <ImageCard 
          key={index} 
          src={card.src} 
          alt={card.alt} 
          title={card.title} 
          subtitle={card.subtitle} 
        />
      ))}
    </div>
  );
};

// Componente para el CTA
interface CTAProps {
  title: string;
  description: string;
  primaryButton: {
    text: string;
    href: string;
  };
  secondaryButton: {
    text: string;
    href: string;
  };
}

const CTA: React.FC<CTAProps> = ({ title, description, primaryButton, secondaryButton }) => {
  return (
    <div className="bg-gray-800 text-white text-center py-12 px-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="max-w-2xl mx-auto mb-8">{description}</p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <a href={primaryButton.href} className="bg-white text-gray-800 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition flex items-center justify-center gap-2">
          {primaryButton.text} <span>→</span>
        </a>
        <a href={secondaryButton.href} className="border border-white px-6 py-2 rounded-full font-medium hover:bg-white hover:text-gray-800 transition">
          {secondaryButton.text}
        </a>
      </div>
    </div>
  );
};

// Componente principal que integra todos los anteriores
const TurismoRegenerativo = () => {
  // Iconos para los beneficios (se pueden reemplazar por los que uses en tu proyecto)
  const plusIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
  
  const coinIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  
  const leafIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  // Datos para los componentes
  const headerData = {
    title: "TURISMO RURAL",
    subtitle: "Turismo Regenerativo en Xochimilco"
  };

  const descriptionText = "Contribuye a la regeneración del ecosistema chinampero a través de un turismo consciente que promueve la conservación de tradiciones ancestrales y la biodiversidad local.";

  const benefitsData = {
    title: "Beneficios del turismo rural en las chinampas",
    benefits: [
      {
        icon: plusIcon,
        title: "Conservación del patrimonio",
        description: "El turismo rural promueve la preservación de las técnicas agrícolas chinamperas y el conocimiento tradicional transmitido por generaciones."
      },
      {
        icon: coinIcon,
        title: "Impacto económico local",
        description: "Generamos oportunidades económicas directas para los productores locales y sus familias, incentivando la continuidad de la agricultura tradicional."
      },
      {
        icon: leafIcon,
        title: "Regeneración ambiental",
        description: "Parte de los ingresos se destina a proyectos de conservación y regeneración del ecosistema de humedales de Xochimilco."
      }
    ]
  };

  const imageCardsData = [
    {
      src: "/images/chinampas-vista-aerea.jpg",
      alt: "Vista aérea de chinampas en Xochimilco",
      title: "Paisaje chinampero",
      subtitle: "Un sistema agrícola único reconocido como Patrimonio de la Humanidad"
    },
    {
      src: "/images/agricultor-tradicional.jpg",
      alt: "Agricultor tradicional trabajando en la chinampa",
      title: "Agricultura tradicional",
      subtitle: "Técnicas sostenibles transmitidas por generaciones"
    },
    {
      src: "/images/productos-frescos.jpg",
      alt: "Productos frescos de la chinampa",
      title: "Del campo a la mesa",
      subtitle: "Productos orgánicos cultivados con técnicas ancestrales"
    }
  ];

  const ctaData = {
    title: "¿Listo para vivir una experiencia inolvidable?",
    description: "Explora la rica tradición chinampera, disfruta de la gastronomía local y conéctate con la naturaleza en una experiencia única en Arca Tierra.",
    primaryButton: {
      text: "Contáctanos",
      href: "/contacto"
    },
    secondaryButton: {
      text: "Ver Productos",
      href: "/productos"
    }
  };

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <Header title={headerData.title} subtitle={headerData.subtitle} />
      <Description text={descriptionText} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        <MainImage src="/images/turismo-regenerativo.jpg" alt="Turismo regenerativo en Xochimilco" />
        <BenefitsSection title={benefitsData.title} benefits={benefitsData.benefits} />
      </div>
      <ImageCardsSection cards={imageCardsData} />
      <CTA 
        title={ctaData.title} 
        description={ctaData.description} 
        primaryButton={ctaData.primaryButton} 
        secondaryButton={ctaData.secondaryButton} 
      />
    </section>
  );
};

export default TurismoRegenerativo;
