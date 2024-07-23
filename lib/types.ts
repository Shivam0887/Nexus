export type PALETTE_NAME =
  | "Radiant Orchid Dream"
  | "Velvet Night"
  | "Oceanic Dream"
  | "Ocean Depths"
  | "Midnight Velvet";

type COLOR_THEME = {
  linearGradient1: {
    stop1: string;
    stop2: string;
  };
  linearGradient2: {
    stop1: string;
    stop2: string;
  };
  radialGradient: {
    stop1: string;
    stop2: string;
  };
};

export type COLOR_PALETTES = Record<PALETTE_NAME, COLOR_THEME>;
