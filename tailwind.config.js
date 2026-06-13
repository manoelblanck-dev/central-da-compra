/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cc: {
          yellow: "#FFBC4B",
          "yellow-dark": "#E9A52F",
          cream: "#FAF6EF", // off-white quente (premium)
          cream2: "#F3EEE5",
          ink: "#16130F", // preto quente
          muted: "#6E665B",
          line: "#EBE5DB",
        },
        shopee: "#EE4D2D",
        mercadolivre: "#2D3277",
        tiktok: "#111111",
        br: { green: "#009739", blue: "#002776", yellow: "#FEDD00" },
      },
      fontFamily: {
        serif: ["var(--font-instrument)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        accent: ["var(--font-instrument)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,16,12,0.04), 0 8px 24px rgba(20,16,12,0.06)",
        cardlg: "0 4px 12px rgba(20,16,12,0.08), 0 24px 48px rgba(20,16,12,0.10)",
      },
      borderRadius: {
        xl: "0.85rem",
        "2xl": "1.1rem",
        "3xl": "1.6rem",
      },
    },
  },
  plugins: [],
};
