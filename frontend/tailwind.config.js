/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0A",
        "bg-surface": "#141414",
        "bg-card": "#1A1A1A",
        "bg-modal": "#1C1C1C",
        fg: "#F5F0E8",
        "fg-muted": "#B0A89A",
        accent: "#FFD700",
        "accent-dark": "#DAA520",
        "accent-glow": "#FFF2A8",
        border: "#2A2A2A",
        "border-gold": "#DAA520",
        error: "#E05555",
        success: "#5FA87A",
      },
      fontFamily: {
        heading: ["'Playfair Display'", "Georgia", "'Times New Roman'", "serif"],
        body: ["'Inter'", "'Helvetica Neue'", "Arial", "sans-serif"],
      },
      fontSize: {
        "scale-xs": ["12px", {}],
        "scale-sm": ["14px", {}],
        "scale-base": ["16px", {}],
        "scale-lg": ["18px", {}],
        "scale-xl": ["24px", {}],
        "scale-2xl": ["32px", {}],
        "scale-3xl": ["48px", {}],
        "scale-4xl": ["64px", {}],
      },
      spacing: {
        0: "4px",
        1: "8px",
        2: "12px",
        3: "16px",
        4: "24px",
        5: "32px",
        6: "48px",
        7: "64px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "20px",
        pill: "999px",
      },
      backgroundImage: {
        spotlight:
          "radial-gradient(ellipse at center, rgba(255,215,0,0.08) 0%, transparent 70%)",
      },
    },
  },
  plugins: [],
};
