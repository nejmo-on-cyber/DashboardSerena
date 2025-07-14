import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Serena pastel color palette
        serena: {
          50: "#faf7ff",
          100: "#f3ecff",
          200: "#e9dcff",
          300: "#d8c0ff",
          400: "#c299ff",
          500: "#a855f7", // Main purple
          600: "#9333ea",
          700: "#7c2d12",
          800: "#581c87",
          900: "#3b0764",
        },
        // Soft pastels for cards and accents
        pastel: {
          purple: "#e9dcff",
          pink: "#fce7f3",
          blue: "#dbeafe",
          green: "#d1fae5",
          yellow: "#fef3c7",
          orange: "#fed7aa",
        },
      },
      backgroundImage: {
        "gradient-serena":
          "linear-gradient(135deg, #faf7ff 0%, #ffffff 50%, #fce7f3 100%)",
        "gradient-serena-dark":
          "linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
