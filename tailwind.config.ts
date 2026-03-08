import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",

        // New Sky-Night Design System Tokens
        "sky-page": "rgb(var(--color-bg-page) / <alpha-value>)",
        "sky-surface": "rgb(var(--color-bg-surface) / <alpha-value>)",
        "sky-surface-elevated": "rgb(var(--color-bg-surface-elevated) / <alpha-value>)",
        "sky-primary": "rgb(var(--color-accent-primary) / <alpha-value>)",
        "sky-secondary": "rgb(var(--color-accent-secondary) / <alpha-value>)",
        "sky-text-primary": "rgb(var(--color-text-primary) / <alpha-value>)",
        "sky-text-secondary": "rgb(var(--color-text-secondary) / <alpha-value>)",
        "sky-border": "rgb(var(--color-border-subtle) / <alpha-value>)",

        // Legacy Support / Aliases
        "brand-primary": "rgb(var(--color-accent-primary) / <alpha-value>)",
        "brand-soft": "rgb(var(--color-bg-surface) / <alpha-value>)",
        "accent-gold": "rgb(var(--color-accent-secondary) / <alpha-value>)",
        "text-muted": "rgb(var(--color-text-secondary) / <alpha-value>)",
        "border-subtle": "rgb(var(--color-border-subtle) / <alpha-value>)",


        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
        sidebar: {
          DEFAULT: "rgb(var(--sidebar) / <alpha-value>)",
          foreground: "rgb(var(--sidebar-foreground) / <alpha-value>)",
          primary: "rgb(var(--sidebar-primary) / <alpha-value>)",
          "primary-foreground": "rgb(var(--sidebar-primary-foreground) / <alpha-value>)",
          accent: "rgb(var(--sidebar-accent) / <alpha-value>)",
          "accent-foreground": "rgb(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "rgb(var(--sidebar-border) / <alpha-value>)",
          ring: "rgb(var(--sidebar-ring) / <alpha-value>)",
        },
      },
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)",
      },
      borderRadius: {
        lg: "20px",
        md: "16px",
        sm: "8px",
        DEFAULT: "16px",
        sharp: "0px",
        rounded: "20px",
        full: "9999px",
        card: "20px",
      },
      boxShadow: {
        subtle: "0 4px 12px rgba(0, 0, 0, 0.05)",
        standard: "0 8px 30px rgba(0, 0, 0, 0.12)",
        elevated: "0 24px 60px rgba(0, 0, 0, 0.75)",
        "sky-glow": "0 0 20px rgba(162, 207, 254, 0.3)",
      },
      // Typography
      fontSize: {
        'h1': ['var(--text-h1)', { lineHeight: 'var(--line-height-h1)' }], // 48-64px
        'h2': ['var(--text-h2)', { lineHeight: 'var(--line-height-h2)' }], // 32-40px
        'h3': ['var(--text-h3)', { lineHeight: 'var(--line-height-h3)' }], // 24-28px
        'body-lg': ['var(--text-body-lg)', { lineHeight: 'var(--line-height-body-lg)' }], // 18-20px
        'body': ['var(--text-body)', { lineHeight: 'var(--line-height-body)' }], // 16px
        'sm': ['var(--text-sm)', { lineHeight: 'var(--line-height-sm)' }], // 14px
        'tiny': ['var(--text-tiny)', { lineHeight: 'var(--line-height-tiny)' }], // 12px
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        syne: ["var(--font-syne)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      backgroundImage: {
        "sky-light-gradient": "linear-gradient(180deg, #E8F4FF 0%, #A2CFFE 40%, #FFFFFF 100%)",
        "night-sky-gradient": "radial-gradient(circle at top, rgba(162,207,254,0.15) 0%, #050816 55%, #02030A 100%)",
      },
    }
  },
  plugins: [],
};

export default config;
