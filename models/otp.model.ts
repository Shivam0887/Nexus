import { Schema, model, models, InferSchemaType } from "mongoose";

const OtpSchema = new Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}).index({ createdAt: 1 }, { expireAfterSeconds: 600 });

const OTP = models.OTP || model("OTP", OtpSchema);

export type TOtp = InferSchemaType<typeof OtpSchema> & {
  _id: Schema.Types.ObjectId;
};
export default OTP;
