import type { Config } from "tailwindcss";
import { screens } from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "386px",
        ...screens,
      },
      colors: {
        primary: "rgb(var(--background-primary))",
        secondary: "rgb(var(--background-dark))",
        "btn-primary": "rgb(var(--btn-primary))",
        "btn-secondary": "rgb(var(--btn-secondary))",
        "text-primary": "rgb(var(--text-primary))",
        "text-secondary": "rgba(var(--text-primary),50%)",
        "sidenav-btn-bg": "rgb(var(--sidenav-btn-bg))",
        "sidenav-btn-primary": "rgb(var(--sidenav-btn-primary))",
        "sidenav-btn-secondary": "rgb(var(--sidenav-btn-secondary))",
      },
      backgroundImage: {
        "gradient-radial":
          "radial-gradient(circle at center, var(--tw-gradient-stops))",
      },
      animation: {
        "infinite-move":
          "move var(--_animation-speed, 10s) linear infinite var(--_animation-direction, forwards)",
        "drawer-open": "drawer_open 0.2s ease-in forwards",
        "drawer-close": "drawer_close 0.2s ease-in forwards",
      },
      keyframes: {
        move: {
          to: {
            transform: "translateX(calc(-50% - 1.25rem))",
          },
        },
        drawer_open: {
          to: {
            height: "288px",
          },
        },
        drawer_close: {
          from: {
            height: "288px",
          },
          to: {
            height: "0",
          },
        },
      },
    },
  },
  plugins: [],
  // blocklist
  // corePlugins
  // darkMode
  // experimental
  // future
  // important
  // prefix
  // presets
  // safelist
  // separator
};

export default config;
