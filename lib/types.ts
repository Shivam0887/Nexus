import { Auth } from "googleapis";
import { LucideIcon } from "lucide-react";

export type PLAN = {
  plan: "Starter" | "Professional";
  price: string;
  desc: string;
  features: {
    content: string;
    icon: LucideIcon;
    available: boolean;
    comingSoon?: boolean;
  }[];
};

export type FAQ = {
  title: string;
  desc: string;
};

export type DrawerDirection = "top" | "left" | "right" | "bottom";

export type FilterKey =
  | "GMAIL"
  | "NOTION"
  | "SLACK"
  | "DISCORD"
  | "GOOGLE_DRIVE"
  | "MICROSOFT_TEAMS"
  | "GITHUB"
  | "GOOGLE_CALENDAR";

export type AdditionalFilterKey =
  | "GOOGLE_DOCS"
  | "GOOGLE_SHEETS"
  | "GOOGLE_SLIDES";

export type CombinedFilterKey = FilterKey | AdditionalFilterKey;

export type Connection = {
  GOOGLE_DRIVE: {
    connectionStatus: number;
  };
  GOOGLE_CALENDAR: {
    connectionStatus: number;
  };
  GOOGLE_DOCS: { searchStatus: boolean };
  GOOGLE_SHEETS: { searchStatus: boolean };
  GOOGLE_SLIDES: { searchStatus: boolean };
} & Record<
  Exclude<FilterKey, "GOOGLE_DRIVE" | "GOOGLE_CALENDAR">,
  {
    connectionStatus: number;
    searchStatus: boolean;
  }
>;

export type StateType = Connection & {
  username: string;
  email: string;
  imageUrl: string;
  hasPasskey: boolean;
  hasSubscription: boolean;
  isAISearch: boolean;
  shouldRemember: boolean;
  aiModel: "gemini" | "ollama";
  plan: PLAN["plan"];
  credits: {
    search: number;
    ai: number;
  };
};

export type ActionType =
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
      type: "CREDIT_DESC_SEARCH";
    }
  | {
      type: "CREDIT_DESC_AI";
    }
  | {
      type: "CHANGE_AI_MODEL";
      payload: "gemini" | "ollama";
    }
  | {
      type: "CONNECTION";
      payload: {
        connectionStatus: number;
        connectionType: FilterKey;
      };
    }
  | {
      type: "SEARCH_STATUS";
      payload: {
        searchStatus: boolean;
        connectionType: Exclude<
          CombinedFilterKey,
          "GOOGLE_DRIVE" | "GOOGLE_CALENDAR"
        >;
      };
    };

export type LogoType = {
  src: string;
  alt: FilterKey;
  desc: string;
  key: string;
  width: number;
  height: number;
};

export type OAuth2Client = Auth.OAuth2Client;

export type Credentials = {
  access_token?: string | null;
  refresh_token?: string | null;
  expires_in?: number | null;
  scope?: string;
  token_type?: string | null;
  id_token?: string | null;
};

export type DocumentType = {
  id: string;
  logo: string;
  title: string;
  date: string;
  author: string;
  email: string;
  href: string;
  content: string;
  key: Exclude<CombinedFilterKey, "GOOGLE_CALENDAR" | "GOOGLE_DRIVE">;
};

export type TDocumentResponse = DocumentType & {
  ranges?: string[];
  type?: "Page" | "Database";
};

export type TSortBy = "" | "date" | "last hour" | "last day" | "last week";

export type TMonth =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December";

export type TSearchCount = {
  "Total Search": number;
  "AI Search": number;
  "Keyword Search": number;
};

export type TActionResponse<T = string> =
  | { success: true; data: T }
  | { success: false; error: string };

export type TSearchHistory = {
  id: string;
  searchItem: string;
  createdAt: Date;
};

export type TSearchResult = {
  [key in Exclude<
    CombinedFilterKey,
    "GOOGLE_CALENDAR" | "GOOGLE_DRIVE"
  >]: number;
};

export type TSlackAxiosResponse = {
  ok: true | false;
  authed_user: {
    id: string;
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };
  team: { id: string; name: string };
  error?: string;
};

export type TSearchableService = Exclude<
  CombinedFilterKey,
  "GOOGLE_DRIVE" | "GOOGLE_CALENDAR"
>;

export type TNotionPageBlockType =
  | "audio"
  | "bookmark"
  | "breadcrumb"
  | "bulleted_list_item"
  | "callout"
  | "child_database"
  | "child_page"
  | "code"
  | "column"
  | "column_list"
  | "divider"
  | "embed"
  | "equation"
  | "file"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "image"
  | "link_preview"
  | "link_to_page"
  | "numbered_list_item"
  | "paragraph"
  | "pdf"
  | "quote"
  | "synced_block"
  | "table"
  | "table_of_contents"
  | "table_row"
  | "template"
  | "to_do"
  | "toggle"
  | "unsupported"
  | "video";

export type TChat = { role: "user" | "assistant"; content: string };
