/** @type {import('tailwindcss').Config} */
// https://realtimecolors.com/?colors=fafafa-050505-fd562a-100f0f-63a419
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      aspectRatio: {},
      colors: {
        primary: "#fd562a",
        pHover: "#bd4220",
        secondary: "#100f0f",
        text: "#fafafa",
        accent: "#63a419",
        background: "#050505",
        neutral: {
          100: "#fafafa",
          200: "#f5f5f5",
          300: "#e5e5e5",
          400: "#d4d4d4",
          500: "#a3a3a3",
          600: "#737373",
          700: "#525252",
          800: "#404040",
          900: "#262626",
        },
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
      },
      margin: "auto",
      width: "100%",
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    // ...
  ],
};
