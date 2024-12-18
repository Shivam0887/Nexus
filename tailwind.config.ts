import type { Config } from "tailwindcss";
import { screens } from "tailwindcss/defaultTheme";

import svgToDataUri from "mini-svg-data-uri";
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

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
      },
      keyframes: {
        move: {
          to: {
            transform: "translateX(calc(-50% - 1.25rem))",
          },
        },
      },
    },
  },
  plugins: [
    function ({ matchUtilities, theme }: any) {
      matchUtilities(
        {
          "bg-grid": (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
          "bg-grid-small": (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
          "bg-dot": (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`
            )}")`,
          }),
        },
        { values: flattenColorPalette(theme("backgroundColor")), type: "color" }
      );
    },
  ],
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
