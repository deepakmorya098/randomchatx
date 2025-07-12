// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      animation: {
        floatHeart: "floatHeart 6s ease-in-out infinite",
      },
      keyframes: {
        floatHeart: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
          "100%": { transform: "translateY(0px)" },
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 255, 255, 0.6)",
      },
      backdropBlur: {
        xs: "2px",
      },
      colors: {
        "glass-dark": "rgba(255, 255, 255, 0.1)",
        "glass-light": "rgba(255, 255, 255, 0.2)",
      },
    },
  },

  plugins: [],
};
