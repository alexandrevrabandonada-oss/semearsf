/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-primary": "#005DAA",
        "brand-primary-dark": "#16324F",
        "brand-primary-soft": "#DCEAF7",
        "bg-page": "#F7FAFC",
        "bg-surface": "#FFFFFF",
        "text-primary": "#16324F",
        "text-secondary": "#44515F",
        "border-subtle": "#D6DEE6",
        "accent-green": "#15803D",
        "accent-yellow": "#D4A514",
        "accent-brown": "#6B3E2E",
        success: "#137333",
        warning: "#B7791F",
        danger: "#B3261E",

        base: "#F7FAFC",
        fundo: "#FFFFFF",
        "fundo-card": "#FFFFFF",
        primaria: "#005DAA",
        ciano: "#16324F",
        cta: "#D4A514",
        acento: "#6B3E2E",
        texto: "#16324F",
        "texto-secundario": "#44515F"
      }
    }
  },
  plugins: []
};
