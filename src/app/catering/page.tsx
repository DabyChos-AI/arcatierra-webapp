import CateringHero from '@/components/catering/Hero';
import CateringAbout from '@/components/catering/About';
import CateringServices from '@/components/catering/Services';
import CateringClients from '@/components/catering/Clients';
import CateringContact from '@/components/catering/Contact';

export default function Catering() {
  return (
    <main className="min-h-screen">
      <div id="hero">
        <CateringHero />
      </div>
      <div id="about">
        <CateringAbout />
      </div>
      <div id="servicios">
        <CateringServices />
      </div>
      <div id="clientes">
        <CateringClients />
      </div>
      <div id="contacto">
        <CateringContact />
      </div>
    </main>
  );
}

