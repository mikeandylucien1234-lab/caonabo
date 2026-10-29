import type { Config } from "tailwindcss";

/**
 * Charte visuelle extraite du prototype Caonabo Airlinje.
 * Les tokens reprennent exactement les couleurs du HTML d'origine.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Indigo / violets de marque
        ink: "#1e1b4b", // texte principal, hero, footer
        "ink-900": "#0f0f2d", // titres quasi-noirs
        purple: {
          DEFAULT: "#5b21b6", // violet primaire
          deep: "#3d1e8a", // violet boutons foncés
          soft: "#f0ecfb", // fond lilas clair (badges)
          softer: "#faf9fc", // fond section FAQ
          ring: "#eef0fd", // fond pills actives
        },
        // Accents
        red: {
          DEFAULT: "#dc2626",
          promo: "#e0402c",
        },
        orange: {
          promo: "#e0752c",
        },
        blue: {
          promo: "#2563eb",
        },
        // Neutres / texte atténué
        muted: {
          DEFAULT: "#5c5c7a",
          light: "#7a7a92",
          lighter: "#8a8aa0",
          faint: "#b4b2c4",
        },
        line: "#e6e4ee", // séparateurs
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      maxWidth: {
        shell: "1536px", // largeur max du prototype
      },
      borderRadius: {
        card: "16px",
        panel: "24px",
        hero: "32px",
      },
      boxShadow: {
        card: "0 4px 20px rgba(30,27,75,0.08)",
        soft: "0 8px 30px rgba(20,10,60,0.12)",
        float: "0 20px 60px rgba(20,10,60,0.18)",
        promo: "0 4px 18px rgba(20,10,60,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
