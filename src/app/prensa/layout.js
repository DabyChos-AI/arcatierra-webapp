import './globals.css'

export const metadata = {
  title: 'Prensa - Arca Tierra | Agricultura Sostenible en Xochimilco',
  description: 'Descubre la cobertura mediática nacional e internacional de Arca Tierra, proyecto pionero de agricultura sostenible y regenerativa en las chinampas de Xochimilco, Ciudad de México.',
  keywords: 'Arca Tierra, agricultura sostenible, chinampas, Xochimilco, agricultura regenerativa, prensa, medios, México',
  authors: [{ name: 'Arca Tierra' }],
  creator: 'Arca Tierra',
  publisher: 'Arca Tierra',
  robots: 'index, follow',
  openGraph: {
    title: 'Prensa - Arca Tierra | Agricultura Sostenible en Xochimilco',
    description: 'Descubre la cobertura mediática nacional e internacional de Arca Tierra, proyecto pionero de agricultura sostenible y regenerativa en las chinampas de Xochimilco.',
    url: 'https://arcatierra.com/prensa',
    siteName: 'Arca Tierra',
    images: [
      {
        url: 'https://arcatierra.com/og-image-prensa.jpg',
        width: 1200,
        height: 630,
        alt: 'Arca Tierra - Agricultura Sostenible en Xochimilco',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prensa - Arca Tierra | Agricultura Sostenible en Xochimilco',
    description: 'Descubre la cobertura mediática nacional e internacional de Arca Tierra, proyecto pionero de agricultura sostenible.',
    images: ['https://arcatierra.com/og-image-prensa.jpg'],
    creator: '@arcatierra',
    site: '@arcatierra',
  },
  alternates: {
    canonical: 'https://arcatierra.com/prensa',
    languages: {
      'es-MX': 'https://arcatierra.com/prensa',
      'en-US': 'https://arcatierra.com/en/press',
    },
  },
  other: {
    'theme-color': '#B15543',
    'msapplication-TileColor': '#B15543',
    'application-name': 'Arca Tierra',
    'geo.region': 'MX-CMX',
    'geo.placename': 'Xochimilco, Ciudad de México',
  }
};

export default function PressLayout({ children }) {
  return (
    <>{children}</>
  );
}
