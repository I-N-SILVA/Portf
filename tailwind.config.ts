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

        // New Design System Tokens
        "brand-primary": "rgb(var(--color-brand-primary) / <alpha-value>)",
        "brand-soft": "rgb(var(--color-brand-soft) / <alpha-value>)",
        "accent-gold": "rgb(var(--color-accent-gold) / <alpha-value>)",
        "text-muted": "rgb(var(--color-text-muted) / <alpha-value>)",
        "border-subtle": "rgb(var(--color-border-subtle) / <alpha-value>)",

        // Compatibility Aliases (Map old names to new tokens where possible)
        "dark-cocoa": "rgb(var(--color-brand-primary) / <alpha-value>)",
        "honey-gold": "rgb(var(--color-accent-gold) / <alpha-value>)",
        "warm-cream": "rgb(var(--color-bg-base) / <alpha-value>)",
        "warm-taupe": "rgb(var(--color-text-muted) / <alpha-value>)",
        "pale-beige": "rgb(var(--color-bg-elevated) / <alpha-value>)",
        "soft-sand": "rgb(var(--color-border-subtle) / <alpha-value>)",


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
        lg: "var(--radius-rounded)", // 12px
        md: "var(--radius-standard)", // 8px
        sm: "var(--radius-subtle)", // 4px
        DEFAULT: "var(--radius-standard)",
        sharp: "var(--radius-sharp)",
        rounded: "var(--radius-rounded)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        subtle: "var(--shadow-subtle)",
        standard: "var(--shadow-standard)",
        elevated: "var(--shadow-elevated)",
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
        serif: ["var(--font-playfair)", "serif"],
      },
    }
  },
  plugins: [],
};

export default config;
