/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#111418",
        fundo: "#1B222A",
        primaria: "#18A572",
        ciano: "#1BA6D6",
        cta: "#F5C400",
        acento: "#C65B2B",
        texto: "#E9EEF3"
      }
    }
  },
  plugins: []
};
