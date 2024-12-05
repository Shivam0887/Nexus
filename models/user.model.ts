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

const optionalPlatformSchmea = {
  refreshToken: defaultStringSchema,
  expiresAt: defaultNumberSchema,
};

const platformSchmea = {
  accessToken: defaultStringSchema,
  connectionStatus: defaultNumberSchema,
  searchResults: defaultNumberSchema,
  searchStatus: defaultBooleanSchema,
};

const googlePlatformSchema = {
  type: {
    searchResults: defaultNumberSchema,
    searchStatus: defaultBooleanSchema,
  },
  default: () => ({}),
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
    birthday: String,
    imageUrl: String,
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
    GMAIL: {
      type: {
        ...platformSchmea,
        ...optionalPlatformSchmea,
        authUser: defaultStringSchema,
        email: defaultStringSchema,
      },
      default: () => ({}),
    },
    GOOGLE_DRIVE: {
      type: {
        ...platformSchmea,
        ...optionalPlatformSchmea,
        authUser: defaultStringSchema,
      },
      default: () => ({}),
    },
    GOOGLE_DOCS: googlePlatformSchema,
    GOOGLE_SHEETS: googlePlatformSchema,
    GOOGLE_SLIDES: googlePlatformSchema,

    GOOGLE_CALENDAR: {
      type: {
        ...optionalPlatformSchmea,
        authUser: defaultStringSchema,
        accessToken: defaultStringSchema,
        connectionStatus: defaultNumberSchema,
      },
      default: () => ({}),
    },
    MICROSOFT_TEAMS: {
      type: {
        ...platformSchmea,
        ...optionalPlatformSchmea,
      },
      default: () => ({}),
    },
    DISCORD: {
      type: {
        ...platformSchmea,
        ...optionalPlatformSchmea,
      },
      default: () => ({}),
    },
    GITHUB: {
      type: {
        installationId: defaultStringSchema,
        ...platformSchmea,
        ...optionalPlatformSchmea,
      },
      default: () => ({}),
    },
    NOTION: {
      type: {
        workspaceId: String,
        botId: String,
        ...platformSchmea,
      },
      default: () => ({}),
    },
    SLACK: {
      type: {
        teamId: String,
        teamName: String,
        ...platformSchmea,
        ...optionalPlatformSchmea,
      },
      default: () => ({}),
    },
  },
  { timestamps: true }
);

export type TUser = InferSchemaType<typeof userSchema>;
export const User = models.User || model("User", userSchema);
