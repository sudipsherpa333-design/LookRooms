import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  listing?: mongoose.Types.ObjectId;
}

const conversationSchema = new Schema<IConversation>({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  listing: { type: Schema.Types.ObjectId, ref: 'Listing' }
}, {
  timestamps: true
});

conversationSchema.index({ participants: 1 });

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);

export interface IMessage extends Document {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  isRead: boolean;
}

const messageSchema = new Schema<IMessage>({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Message = mongoose.model<IMessage>('Message', messageSchema);
