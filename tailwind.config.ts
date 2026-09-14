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
          bg: "#0D0D0D",
          surface: "#141414",
          surfaceHover: "#1A1A1A",
          border: "#262626",
          borderSubtle: "rgba(255, 255, 255, 0.08)",
          textPrimary: "#FFFFFF",
          textSecondary: "#A3A3A3",
          textMuted: "#737373",
          pill: "rgba(255, 255, 255, 0.05)",
          pillBorder: "rgba(255, 255, 255, 0.12)",
          gold: "#F59E0B",
          emerald: "#10B981",
          rose: "#F43F5E",
          cyan: "#38BDF8",
        },
      },
      fontFamily: {
        serif: ["Newsreader", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "Space Mono", "monospace"],
      },
      borderRadius: {
        pill: "100px",
      },
      letterSpacing: {
        widestBadge: "0.18em",
      },
    },
  },
  plugins: [],
};
export default config;
