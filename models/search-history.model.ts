import { InferSchemaType, Schema, Types, model, models } from "mongoose";

const searchHistorySchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  searchItem: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

searchHistorySchema.index({ userId: 1 });

export type TSearchHistorySchema = InferSchemaType<
  typeof searchHistorySchema
> & {
  _id: Types.ObjectId;
};

export const SearchHistory =
  models.SearchHistory || model("SearchHistory", searchHistorySchema);
