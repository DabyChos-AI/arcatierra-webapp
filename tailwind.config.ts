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
          // R15 · F1 (CLARO1, contrato C19, a pedido de front-pulido): el mismo tono que `suave`, más oscuro, para el panel
          // (5.59:1 sobre blanco; `suave` da 3.77). Solo adición: nadie más lo usa.
          'medio': '#596C64',
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
        // R15 · F1 (WF1, contrato §9 C16): tokens del sitio nuevo, del `:root` de la maqueta (hand-off §4). Solo se usan
        // dentro de src/app/nuevo/** y src/components/sitio-nuevo/**; el sitio de hoy y el panel no cambian.
        'sn': {
          'tinta': '#3D2A1A',    // --ink: texto
          'terra': '#975543',    // --terra: botones principales, títulos
          'oxido': '#BA6440',    // --rust: variante de terra, isotipo
          'arena': '#CCBB9A',    // --sand
          'crema': '#E3DBCB',    // --cream: secciones secundarias
          'calido': '#F0EBE2',   // --warm: fondo del sitio
          'borde': '#D8D0C0',    // --border
          'gris': '#748880',     // --muted: textos secundarios
          'verde': '#475A52',    // --green: pie, puntos del isotipo
          'oro': '#DCB584',      // --gold
          'azul': '#C1CCCE',     // --blue
          'bosque': '#3F5A4D',   // --forest
          'durazno': '#F2D4A8',  // --peach: acentos del pie
          'ambar': '#D4A24C',    // --amber
          'vivo': '#C66B3A',     // --rust-bright: el «bump» del contador
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
        // R15 · F1 (C16): letras del sitio nuevo; las variables las define next/font/local SOLO en src/app/nuevo/layout.tsx.
        'sn-titulos': ['var(--sn-fuente-titulos)', 'Georgia', 'serif'],
        'sn-texto': ['var(--sn-fuente-texto)', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        'sn-mono': ['var(--sn-fuente-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'section': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        // R15 · F1 (C16): espacios de 8 px del sitio nuevo (sn-N = N × 8 px).
        'sn-1': '8px',
        'sn-2': '16px',
        'sn-3': '24px',
        'sn-4': '32px',
        'sn-5': '40px',
        'sn-6': '48px',
        'sn-7': '56px',
        'sn-8': '64px',
        'sn-10': '80px',
        'sn-12': '96px',
        'sn-15': '120px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // R15 · F1 (C16): radios del sitio nuevo (hand-off §4).
        'sn-pildora': '999px',
        'sn-boton': '6px',
        'sn-tarjeta': '14px',
      },
      boxShadow: {
        'terracota': '0 4px 12px rgba(177, 85, 67, 0.3)',
        'verde': '0 4px 12px rgba(51, 80, 62, 0.3)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'medium': '0 8px 24px rgba(0, 0, 0, 0.15)',
        // R15 · F1 (C16): sombras del sitio nuevo (cabecera al bajar, anuncio, menú del celular).
        'sn-pegada': '0 1px 0 rgba(61, 35, 20, 0.06), 0 8px 24px rgba(61, 35, 20, 0.04)',
        'sn-anuncio': '0 12px 32px rgba(0, 0, 0, 0.18)',
        'sn-cajon': '-12px 0 60px rgba(0, 0, 0, 0.18)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        // R15 · F1: la cinta del sitio nuevo (el ticker de la maqueta: 50 s, va y vuelve a empezar).
        'sn-cinta': 'snCinta 50s linear infinite',
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
        snCinta: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
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

