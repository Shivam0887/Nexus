import { LucideIcon } from "lucide-react";

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

export type PLAN = {
  plan: "Starter" | "Professional";
  price: string;
  desc: string;
  features: {
    content: string;
    icon: LucideIcon;
    available: boolean;
  }[];
};

export type FAQ = {
  title: string;
  desc: string;
};

export type PasskeyState = {
  success: boolean;
  error: string;
};

export type DrawerDirection = "top" | "left" | "right" | "bottom";

export type StateType = {
  username: string;
  email: string;
  imageUrl: string;
  coverImage: string;
  hasPasskey: boolean;
  isAISearch: boolean;
  shouldRemember: boolean;
  hasSubscription: boolean;
  plan: PLAN["plan"];
};

export type ActionType =
  | {
      type: "COVER_IMAGE_CHANGE";
      payload: string;
    }
  | {
      type: "PASSKEY_CREATE";
      payload: boolean;
    }
  | {
      type: "PROFILE_IMAGE_CHANGE";
      payload: string;
    }
  | {
      type: "AI_SEARCH_CHANGE";
      payload: boolean;
    }
  | {
      type: "USERNAME_CHANGE";
      payload: string;
    }
  | {
      type: "PLAN_CHANGE";
      payload: PLAN["plan"];
    };
