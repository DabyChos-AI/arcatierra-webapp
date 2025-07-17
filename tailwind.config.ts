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
        },
        'verde': {
          DEFAULT: '#33503E',
          'tipografia': '#3A4741',
          'principal': '#33503E',
          'claro': '#475A52',
          'suave': '#748880',
        },
        'neutro': {
          'crema': '#E3DBCB',
          'beige': '#CCBB9A',
          'calido': '#DCB584',
          'gris': '#C1CCCE',
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
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'display': ['Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'section': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
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

