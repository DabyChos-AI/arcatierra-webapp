import { 
  ResponsiveContainer, 
  ResponsiveGrid, 
  H1, 
  H2,
  H3,
  LeadText, 
  BodyText,
  ResponsiveSection 
} from '@/components/ui/responsive';

export default function TestResponsive() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <ResponsiveSection spacing="xl" background="gradient">
        <ResponsiveContainer>
          <H1 className="text-white text-center mb-6">
            Test Responsive Components
          </H1>
          <LeadText className="text-white text-center">
            Verificando que todos los componentes funcionan correctamente
          </LeadText>
        </ResponsiveContainer>
      </ResponsiveSection>

      {/* Grid Products */}
      <ResponsiveSection spacing="lg">
        <ResponsiveContainer>
          <H2 className="mb-8 text-center">Grid Products (1→2→3→4)</H2>
          <ResponsiveGrid variant="products">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <div key={num} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="aspect-square bg-gray-200 rounded mb-4" />
                <H3 className="mb-2">Producto {num}</H3>
                <BodyText className="text-gray-600">
                  Descripción del producto de ejemplo
                </BodyText>
              </div>
            ))}
          </ResponsiveGrid>
        </ResponsiveContainer>
      </ResponsiveSection>

      {/* Grid Features */}
      <ResponsiveSection spacing="lg" background="gray">
        <ResponsiveContainer>
          <H2 className="mb-8 text-center">Grid Features (1→2→3)</H2>
          <ResponsiveGrid variant="features">
            {[1, 2, 3, 4, 5, 6].map(num => (
              <div key={num} className="bg-white p-6 rounded-lg shadow-sm">
                <H3 className="mb-2">Feature {num}</H3>
                <BodyText className="text-gray-600">
                  Descripción de la característica
                </BodyText>
              </div>
            ))}
          </ResponsiveGrid>
        </ResponsiveContainer>
      </ResponsiveSection>

      {/* Grid Stats */}
      <ResponsiveSection spacing="lg">
        <ResponsiveContainer>
          <H2 className="mb-8 text-center">Grid Stats (1→2→4)</H2>
          <ResponsiveGrid variant="stats">
            {['1,200kg', '50,000L', '800kg', '45'].map((stat, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="text-4xl font-bold text-verde-principal mb-2">
                  {stat}
                </div>
                <BodyText className="text-gray-600">
                  Métrica {idx + 1}
                </BodyText>
              </div>
            ))}
          </ResponsiveGrid>
        </ResponsiveContainer>
      </ResponsiveSection>

      {/* Container Sizes */}
      <ResponsiveSection spacing="lg" background="gray">
        <ResponsiveContainer size="sm">
          <div className="bg-white p-6 rounded-lg">
            <H2 className="mb-4">Container Small (max-w-3xl)</H2>
            <BodyText>
              Este contenedor es ideal para contenido de lectura como artículos o posts de blog.
              El ancho máximo es de 768px para facilitar la lectura.
            </BodyText>
          </div>
        </ResponsiveContainer>

        <ResponsiveContainer size="md" className="mt-8">
          <div className="bg-white p-6 rounded-lg">
            <H2 className="mb-4">Container Medium (max-w-5xl)</H2>
            <BodyText>
              Este contenedor es ideal para formularios y contenido de ancho medio.
              El ancho máximo es de 1024px.
            </BodyText>
          </div>
        </ResponsiveContainer>

        <ResponsiveContainer size="lg" className="mt-8">
          <div className="bg-white p-6 rounded-lg">
            <H2 className="mb-4">Container Large (max-w-7xl) - ESTÁNDAR</H2>
            <BodyText>
              Este es el contenedor estándar de Arcatierra. El ancho máximo es de 1280px
              y se usa en la mayoría de las páginas.
            </BodyText>
          </div>
        </ResponsiveContainer>
      </ResponsiveSection>

      {/* Typography */}
      <ResponsiveSection spacing="lg">
        <ResponsiveContainer>
          <H1 className="mb-4">Heading 1 - Escala Responsive</H1>
          <H2 className="mb-4">Heading 2 - Escala Responsive</H2>
          <H3 className="mb-4">Heading 3 - Escala Responsive</H3>
          <LeadText className="mb-4">
            Lead Text - Texto introductorio que escala de forma responsive
          </LeadText>
          <BodyText>
            Body Text - Texto de cuerpo que mantiene legibilidad en todos los dispositivos
          </BodyText>
        </ResponsiveContainer>
      </ResponsiveSection>

      {/* Testing Instructions */}
      <ResponsiveSection spacing="xl" background="gradient">
        <ResponsiveContainer>
          <H2 className="text-white text-center mb-6">
            ✅ Testing Checklist
          </H2>
          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <ul className="space-y-3 text-white">
              <li>✅ H1 escala con viewport (text-3xl → 4xl → 5xl → 6xl)</li>
              <li>✅ Container centrado con padding responsive</li>
              <li>✅ Grid products: 1 col mobile → 2 tablet → 3-4 desktop</li>
              <li>✅ Grid features: 1 col mobile → 2 tablet → 3 desktop</li>
              <li>✅ Grid stats: 1 col mobile → 2 tablet → 4 desktop</li>
              <li>✅ Spacing vertical progresivo (py-12 → py-16 → py-20)</li>
              <li>✅ Todo legible en mobile (sin zoom)</li>
              <li>✅ Sin scroll horizontal</li>
            </ul>
          </div>
        </ResponsiveContainer>
      </ResponsiveSection>
    </div>
  );
}
