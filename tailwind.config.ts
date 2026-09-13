import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        genc: {
          bg: "#0B0F17",
          card: "#111827",
          cardHover: "#182234",
          border: "#1F2937",
          accent: "#6366F1",
          accentGlow: "rgba(99, 102, 241, 0.2)",
          gold: "#F59E0B",
          emerald: "#10B981",
          rose: "#F43F5E",
          cyan: "#06B6D4",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
