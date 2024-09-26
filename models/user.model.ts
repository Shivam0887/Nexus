import { Schema, model, models, InferSchemaType } from "mongoose";

const platformSchema = new Schema({
  accessToken: String,
  refreshToken: String,
  expiresAt: Number,
  authUser: String,
  dataCollection: {
    type: Boolean,
    default: () => false,
  },
  lastSync: {
    type: Number,
    default: () => 0,
  },
});

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
    gmail: platformSchema,
    google_docs: platformSchema,
    google_drive: platformSchema,
    google_calendar: platformSchema,
    teams: platformSchema,
    discord: platformSchema,
    gitHub: platformSchema,
    notion: platformSchema,
    slack: platformSchema,
    oneDrive: platformSchema,
  },
  { timestamps: true }
);

export type UserType = InferSchemaType<typeof userSchema> & {
  _id: Schema.Types.ObjectId;
};

export const User = models.User || model("User", userSchema);
