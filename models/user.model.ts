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
  },
  { timestamps: true }
);

export type UserType = InferSchemaType<typeof userSchema> & {
  _id: Schema.Types.ObjectId;
};

export const User = models.User || model("User", userSchema);
