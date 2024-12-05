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
}).index({ userId: 1 });

const temporarySearchHistorySchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  searchItem: String,
  // schema automatically deletes after 3 months: 60 * 60 * 24 * 90 = 7776000
  createdAt: {
    type: Date,
    default: Date.now,
  },
}).index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export type TSearchHistorySchema = InferSchemaType<
  typeof searchHistorySchema
> & {
  _id: Types.ObjectId;
};

export const SearchHistory =
  models.SearchHistory || model("SearchHistory", searchHistorySchema);

export const TemporarySearchHistory =
  models.TemporarySearchHistory ||
  model("TemporarySearchHistory", temporarySearchHistorySchema);
