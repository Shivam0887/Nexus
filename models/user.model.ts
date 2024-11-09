import { Schema, model, models, InferSchemaType } from "mongoose";

const defaultBooleanSchema = {
  type: Boolean,
  default: () => false,
};

const defaultStringSchema = {
  type: String,
  default: () => "",
};

const defaultNumberSchema = {
  type: Number,
  default: () => 0,
};

const platformSchmea = {
  type: {
    accessToken: defaultStringSchema,
    refreshToken: defaultStringSchema,
    authUser: defaultStringSchema,
    expiresAt: defaultNumberSchema,
    searchResults: defaultNumberSchema,
  },
  default: () => ({
    accessToken: "",
    refreshToken: "",
    authUser: "",
    expiresAt: 0,
    searchResults: 0,
  }),
};

const searchCountSchema = new Schema(
  {
    "Total Search": defaultNumberSchema,
    "AI Search": defaultNumberSchema,
    "Keyword Search": defaultNumberSchema,
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    userId: {
      type: String,
      unique: true,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    searchCount: {
      type: Map,
      of: searchCountSchema,
      default: () => new Map(),
    },
    searchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "SearchHistory",
      },
    ],
    passkey: defaultStringSchema,
    hasPasskey: defaultBooleanSchema,
    shouldRemember: defaultBooleanSchema,
    isAISearch: defaultBooleanSchema,
    hasSubscription: defaultBooleanSchema,
    GMAIL: platformSchmea,
    GOOGLE_DRIVE: {
      type: {
        GOOGLE_DOCS: {
          type: {
            searchResults: defaultNumberSchema,
            connectionStatus: defaultBooleanSchema,
          },
          default: () => ({ searchResults: 0, connectionStatus: false }),
        },
        GOOGLE_SHEETS: {
          type: {
            searchResults: defaultNumberSchema,
            connectionStatus: defaultBooleanSchema,
          },
          default: () => ({ searchResults: 0, connectionStatus: false }),
        },
        GOOGLE_SLIDES: {
          type: {
            searchResults: defaultNumberSchema,
            connectionStatus: defaultBooleanSchema,
          },
          default: () => ({ searchResults: 0, connectionStatus: false }),
        },
        accessToken: defaultStringSchema,
        refreshToken: defaultStringSchema,
        authUser: defaultStringSchema,
        expiresAt: defaultNumberSchema,
      },
      default: () => ({}),
    },
    GOOGLE_CALENDAR: platformSchmea,
    MICROSOFT_TEAMS: platformSchmea,
    DISCORD: platformSchmea,
    GITHUB: platformSchmea,
    NOTION: {
      type: {
        workspaceId: String,
        botId: String,
        ...platformSchmea.type,
      },
      default: () => ({}),
    },
    SLACK: {
      type: {
        teamId: String,
        teamName: String,
        ...platformSchmea.type,
      },
      default: () => ({}),
    },
  },
  { timestamps: true }
);

export type UserType = InferSchemaType<typeof userSchema> & {
  _id: Schema.Types.ObjectId;
};

export const User = models.User || model("User", userSchema);
