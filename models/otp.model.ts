import { Schema, model, models, InferSchemaType } from "mongoose";

const OtpSchema = new Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

// Create a TTL index on the `expiresAt` field
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = models.OTP || model("OTP", OtpSchema);

export type TOtp = InferSchemaType<typeof OtpSchema> & {
  _id: Schema.Types.ObjectId;
};
export default OTP;
