import mongoose, { Schema, Document } from 'mongoose';

export interface ISearchHistory extends Document {
  user: mongoose.Types.ObjectId;
  query: string;
  filters: any;
  timestamp: Date;
}

const searchHistorySchema = new Schema<ISearchHistory>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  query: { type: String, required: true },
  filters: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

export const SearchHistory = mongoose.model<ISearchHistory>('SearchHistory', searchHistorySchema);
