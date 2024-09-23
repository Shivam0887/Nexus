import { Schema, model, models, InferSchemaType } from "mongoose";

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
    passkey: String,
    hasPasskey: {
      type: Boolean,
      default: () => false,
    },
    shouldRemember: {
      type: Boolean,
      default: () => false,
    },
    isFilterApplied: {
      type: Boolean,
      default: () => false,
    },
    filter: {
      type: [String],
      default: () => [],
    },
    isAISearch: {
      type: Boolean,
      default: () => false,
    },
    hasSubscription: {
      type: Boolean,
      default: () => false,
    },
    gmail: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Number,
      authUser: String,
      dataCollection: {
        type: Boolean,
        default: () => false,
      },
    },
    google_docs: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Number,
      authUser: String,
      dataCollection: {
        type: Boolean,
        default: () => false,
      },
    },
    google_drive: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Number,
      authUser: String,
      dataCollection: {
        type: Boolean,
        default: () => false,
      },
    },
    google_calendar: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Number,
      authUser: String,
    },
    teams: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Number,
      dataCollection: {
        type: Boolean,
        default: () => false,
      },
    },
    discord: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Number,
      dataCollection: {
        type: Boolean,
        default: () => false,
      },
    },
    gitHub: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Number,
      dataCollection: {
        type: Boolean,
        default: () => false,
      },
    },
    notion: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Number,
      dataCollection: {
        type: Boolean,
        default: () => false,
      },
    },
    slack: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Number,
      dataCollection: {
        type: Boolean,
        default: () => false,
      },
    },
    oneDrive: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Number,
      dataCollection: {
        type: Boolean,
        default: () => false,
      },
    },
  },
  { timestamps: true }
);

export type UserType = InferSchemaType<typeof userSchema> & {
  _id: Schema.Types.ObjectId;
};

export const User = models.User || model("User", userSchema);
