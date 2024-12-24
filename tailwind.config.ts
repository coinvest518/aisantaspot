import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#3B82F6",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#22C55E",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Add sidebar colors
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background, 222.2 84% 4.9%))",
          foreground: "hsl(var(--sidebar-foreground, 210 40% 98%))",
          muted: "hsl(var(--sidebar-muted, 217.2 32.6% 17.5%))",
          accent: "hsl(var(--sidebar-accent, 217.2 32.6% 17.5%))",
          border: "hsl(var(--sidebar-border, 217.2 32.6% 17.5%))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        // Add sidebar width
        sidebar: "16rem", // 256px
        "sidebar-sm": "4rem", // 64px for collapsed state
      },
      width: {
        sidebar: "var(--sidebar-width, 16rem)",
        "sidebar-sm": "var(--sidebar-width-sm, 4rem)",
      },
      maxWidth: {
        sidebar: "var(--sidebar-width, 16rem)",
        "sidebar-sm": "var(--sidebar-width-sm, 4rem)",
      },
      minWidth: {
        sidebar: "var(--sidebar-width, 16rem)",
        "sidebar-sm": "var(--sidebar-width-sm, 4rem)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "sidebar-slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "sidebar-slide-out": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "sidebar-in": "sidebar-slide-in 0.2s ease-out",
        "sidebar-out": "sidebar-slide-out 0.2s ease-out",
      },
      transitionProperty: {
        width: "width",
        spacing: "margin, padding",
      },
      zIndex: {
        sidebar: "40",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Add custom plugin for sidebar utilities
    function({ addUtilities }) {
      addUtilities({
        ".sidebar-scrollbar": {
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "hsl(var(--sidebar-border))",
            borderRadius: "2px",
          },
        },
      });
    },
  ],
} satisfies Config;