import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#667eea",
        secondary: "#764ba2",
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out",
        popIn: "popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        shake: "shake 0.4s cubic-bezier(.36,.07,.19,.97) both",
        pulse: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        slideInFromTop: "slideInFromTop 0.3s ease-out",
        tilePress: "tilePress 0.15s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        popIn: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shake: {
          "10%, 90%": { transform: "translate3d(-1px, 0, 0)" },
          "20%, 80%": { transform: "translate3d(2px, 0, 0)" },
          "30%, 50%, 70%": { transform: "translate3d(-4px, 0, 0)" },
          "40%, 60%": { transform: "translate3d(4px, 0, 0)" },
        },
        slideInFromTop: {
          "0%": { 
            transform: "translateY(-100%)",
            opacity: "0",
          },
          "100%": { 
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        tilePress: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

