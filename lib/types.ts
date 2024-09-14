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
  isFilterApplied: boolean;
  filter: FilterKey[];
  hasSubscription: boolean;
  plan: PLAN["plan"];
  isGmailConnected: boolean;
  isGoogleDriveConnected: boolean;
  isGoogleDocsConnected: boolean;
  isGoogleCalendarConnected: boolean;
  isDiscordConnected: boolean;
  isNotionConnected: boolean;
  isSlackConnected: boolean;
  isTeamsConnected: boolean;
  isGitHubConnected: boolean;
  isOneDriveConnected: boolean;
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
    }
  | {
      type: "FILTER_SAVE";
      payload: FilterKey[];
    }
  | {
      type: "FILTER_RESET";
    }
  | {
      type: "CONNECTION";
      payload: boolean;
      connectionType: string;
    };

export type FilterKey =
  | "Gmail"
  | "Notion"
  | "Slack"
  | "Discord"
  | "Google Drive"
  | "MS Teams"
  | "GitHub"
  | "Google Docs"
  | "OneDrive";

export type LogoType = {
  src: string;
  alt: FilterKey;
  desc: string;
  key: string;
  width: number;
  height: number;
};

export type Credentials = {
  access_token?: string | null;
  refresh_token?: string | null;
  expires_in?: number | null;
  scope?: string;
  token_type?: string | null;
  id_token?: string | null;
};

export type DocumentType = {
  logo: string;
  title: string;
  date: string;
  author: string;
  email: string;
  href: string;
};
