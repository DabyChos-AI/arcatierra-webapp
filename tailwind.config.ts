import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // COLORES OFICIALES ARCA TIERRA
        'terracota': {
          DEFAULT: '#B15543',
          'principal': '#B15543',
          'medio': '#BA6440',
          'oscuro': '#975543',
          'dark': '#8A3F30',
        },
        'verde': {
          DEFAULT: '#33503E',
          'tipografia': '#3A4741',
          'principal': '#33503E',
          'claro': '#475A52',
          'suave': '#748880',
          'dark': '#1F3024',
        },
        'neutro': {
          'crema': '#E3DBCB',
          'beige': '#CCBB9A',
          'calido': '#DCB584',
          'gris': '#C1CCCE',
          'light': '#F5F1EA',
          'borde': '#E5E0D6',
        },
        'amarillo': {
          DEFAULT: '#F59E0B',
          'bg': '#FEF3C7',
        },
        'azul': {
          DEFAULT: '#0369A1',
          'bg': '#F0F9FF',
        },
        'rojo': {
          DEFAULT: '#DC2626',
          'bg': '#FEE2E2',
        },
        'morado': {
          DEFAULT: '#7C3AED',
          'bg': '#EDE9FE',
        },
        'rosa': {
          DEFAULT: '#DB2777',
          'bg': '#FCE7F3',
        },
        // R15 · F1 v2 (contrato v2 §9 C16; cadena-v2/f1/CONTRATO-BASE-F1.md §2): colores del sitio nuevo = los valores del `:root`
        // de la maqueta, medidos con Playwright, con su mismo nombre (--teal = --muted y --cafe = --ink no se repiten). Solo los usan
        // src/app/nuevo/** y src/components/sitio-nuevo/**: el sitio de hoy y el panel no cambian.
        'sn': {
          'ink': '#3D2A1A',
          'terra': '#975543',
          'rust': '#BA6440',
          'sand': '#CCBB9A',
          'cream': '#E3DBCB',
          'warm': '#F0EBE2',
          'muted': '#748880',
          'border': '#D8D0C0',
          'green': '#475A52',
          'gold': '#DCB584',
          'blue': '#C1CCCE',
          'forest': '#3F5A4D',
          'amber': '#D4A24C',
          'peach': '#F2D4A8',
          'rust-bright': '#C66B3A',
        },
        // VARIABLES SHADCN/UI PERSONALIZADAS
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)'
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)'
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)'
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      fontFamily: {
        // TIPOGRAFÍAS OFICIALES ARCA TIERRA - Manual de Identidad
        // Akkurat: Tipografía secundaria para CUERPOS DE TEXTO
        'sans': ['var(--font-akkurat)', 'Inter', '-apple-system', 'sans-serif'],
        'body': ['var(--font-akkurat)', 'Inter', 'sans-serif'],
        // Mendoza: Tipografía primaria para TÍTULOS
        'display': ['var(--font-mendoza)', 'Georgia', 'serif'],
        'heading': ['var(--font-mendoza)', 'Georgia', 'serif'],
        // Aliases directos
        'mendoza': ['var(--font-mendoza)', 'Georgia', 'serif'],
        'akkurat': ['var(--font-akkurat)', 'Inter', 'sans-serif'],
        // R15 · F1 v2 (C14, C15): letras del sitio nuevo; las variables las pone src/components/sitio-nuevo/fuentes.ts en el envoltorio
        // [data-sitio-nuevo]. Respaldos del hand-off §4.
        'sn-titulos': ['var(--sn-fuente-titulos)', 'Georgia', 'serif'],
        'sn-texto': ['var(--sn-fuente-texto)', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        'sn-mono': ['var(--sn-fuente-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'section': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
        // R15 · F1 v2 (C16; CONTRATO-BASE-F1 §3.1): escala del sitio nuevo, de las reglas declaradas de la maqueta.
        'sn-hero-xl': ['clamp(56px, 6vw, 96px)', { lineHeight: '1', letterSpacing: '-1.5px' }],
        'sn-hero': ['clamp(48px, 5.5vw, 84px)', { lineHeight: '0.98', letterSpacing: '-1.5px' }],
        'sn-h2': ['clamp(36px, 4vw, 56px)', { lineHeight: '1.05', letterSpacing: '-0.8px' }],
        'sn-h3': ['clamp(28px, 3vw, 40px)', { lineHeight: '1.12', letterSpacing: '-0.4px' }],
        'sn-h4': ['28px', { lineHeight: '1.1', letterSpacing: '-0.3px' }],
        'sn-h5': ['22px', { lineHeight: '1.15', letterSpacing: '-0.3px' }],
        'sn-h6': ['20px', { lineHeight: '1.2', letterSpacing: '-0.3px' }],
        'sn-cuerpo-lg': ['17px', { lineHeight: '1.6', letterSpacing: '-0.3px' }],
        'sn-cuerpo': ['16px', { lineHeight: '1.55', letterSpacing: '-0.3px' }],
        'sn-cuerpo-sm': ['14px', { lineHeight: '1.55', letterSpacing: '-0.3px' }],
        'sn-cuerpo-xs': ['13px', { lineHeight: '1.5', letterSpacing: '-0.3px' }],
        'sn-eyebrow': ['11px', { lineHeight: '1.55', letterSpacing: '1.8px' }],
        'sn-etiqueta': ['11px', { lineHeight: '1.55', letterSpacing: '1.2px' }],
        'sn-etiqueta-sm': ['10px', { lineHeight: '1.55', letterSpacing: '1.1px' }],
        'sn-micro': ['9px', { lineHeight: '1.55', letterSpacing: '1.2px' }],
        'sn-boton': ['12px', { lineHeight: '1.55', letterSpacing: '1.4px' }],
        'sn-boton-sm': ['11px', { lineHeight: '1.55', letterSpacing: '1.2px' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        // R15 · F1 v2 (C16; CONTRATO-BASE-F1 §3.2): ritmo del sitio nuevo (hand-off §4 y la maqueta medida a 1440 y 390).
        'sn-seccion': '80px',
        'sn-seccion-lg': '96px',
        'sn-seccion-xl': '120px',
        'sn-seccion-movil': '56px',
        'sn-seccion-lg-movil': '72px',
        'sn-lateral': '40px',
        'sn-lateral-movil': '24px',
      },
      // R15 · F1 v2 (C16; CONTRATO-BASE-F1 §3.5): anchos máximos de los contenedores de la maqueta.
      maxWidth: {
        'sn-contenido': '1280px',
        'sn-medio': '1200px',
        'sn-angosto': '1100px',
        'sn-titulo': '880px',
        'sn-parrafo': '620px',
      },
      borderRadius: {
        // R15 · F1 v2 (C16; CONTRATO-BASE-F1 §3.3): radios de la maqueta (hand-off §4 y medidos).
        'sn-pildora': '999px',
        'sn-boton': '6px',
        'sn-campo': '8px',
        'sn-tarjeta': '14px',
        'sn-panel': '18px',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      boxShadow: {
        'terracota': '0 4px 12px rgba(177, 85, 67, 0.3)',
        'verde': '0 4px 12px rgba(51, 80, 62, 0.3)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'medium': '0 8px 24px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
      backgroundImage: {
        'gradient-terracota': 'linear-gradient(135deg, #B15543 0%, #BA6440 100%)',
        'gradient-verde': 'linear-gradient(135deg, #33503E 0%, #475A52 100%)',
        'gradient-neutro': 'linear-gradient(135deg, #E3DBCB 0%, #CCBB9A 100%)',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;

