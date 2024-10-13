import { Schema, model, models, InferSchemaType } from "mongoose";

const defaultBooleanSchema = {
  type: Number,
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
  },
  default: () => ({
    accessToken: "",
    refreshToken: "",
    expiresAt: 0,
    authUser: "",
  }),
};

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
    passkey: defaultStringSchema,
    hasPasskey: defaultBooleanSchema,
    shouldRemember: defaultBooleanSchema,
    isFilterApplied: defaultBooleanSchema,
    filter: {
      type: [String],
      default: () => [],
    },
    isAISearch: defaultBooleanSchema,
    hasSubscription: defaultBooleanSchema,
    GMAIL: platformSchmea,
    GOOGLE_DOCS: platformSchmea,
    GOOGLE_DRIVE: platformSchmea,
    GOOGLE_CALENDAR: platformSchmea,
    MICROSOFT_TEAMS: platformSchmea,
    DISCORD: platformSchmea,
    GITHUB: platformSchmea,
    NOTION: platformSchmea,
    SLACK: platformSchmea,
  },
  { timestamps: true }
);

export type UserType = InferSchemaType<typeof userSchema> & {
  _id: Schema.Types.ObjectId;
};

export const User = models.User || model("User", userSchema);
