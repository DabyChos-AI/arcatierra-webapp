import React from 'react';
import IntroductionNew from '@/components/experiencias-premium/IntroductionNew';
import PublicExperiencesNew from '@/components/experiencias-premium/PublicExperiencesNew';
import PrivateExperiencesNew from '@/components/experiencias-premium/PrivateExperiencesNew';
import RuralTourism from '@/components/experiencias-premium/RuralTourism';
import CTA from '@/components/experiencias-premium/CTA';
import ToastProvider from '@/components/experiencias-premium/ToastProvider';

export const metadata = {
  title: 'Experiencias Premium | Arca Tierra',
  description: 'Descubre nuestras experiencias de turismo rural y gastronómico en Xochimilco, conecta con la naturaleza y la tradición chinampera.',
};

export default function ExperienciasPremium() {
  return (
    <main>
      <ToastProvider />
      <IntroductionNew />
      <PublicExperiencesNew />
      <PrivateExperiencesNew />
      <RuralTourism />
      <CTA />
    </main>
  );
}
