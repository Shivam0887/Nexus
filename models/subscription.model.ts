import { Schema, models, model, InferSchemaType } from "mongoose";

const subscriptionSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  subId: {
    type: String,
    required: true,
  },
  planId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "cancelled", "expired"],
    required: true,
  },
  currentStart: {
    type: Number,
    required: true,
  },
  currentEnd: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  invoiceId: {
    type: String,
    required: true,
  },
});

subscriptionSchema.index({ subId: 1 });

export type TSubscription = InferSchemaType<typeof subscriptionSchema>;
export const Subscription =
  models.Subscription || model("Subscription", subscriptionSchema);
