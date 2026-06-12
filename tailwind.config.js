/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Identidade visual da Central da Compra
        cc: {
          yellow: "#FFBC4B",       // cor principal (botões, destaques)
          "yellow-dark": "#F0A92E", // hover dos botões
          cream: "#FFF8EC",         // fundo de seções suaves / banner
          ink: "#211C15",           // texto principal (preto quentinho)
          muted: "#6B6357",         // texto secundário
          line: "#ECE7DE",          // bordas
        },
        // Cores das plataformas (badges)
        shopee: "#EE4D2D",
        mercadolivre: "#2D3277",
        tiktok: "#111111",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(33,28,21,0.06), 0 8px 24px rgba(33,28,21,0.05)",
      },
    },
  },
  plugins: [],
};
