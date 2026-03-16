import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String },
  image: { type: String },
  messageType: { type: String, enum: [
    'text','image','file','audio',
    'template','system','location', 'reaction'
  ], default: "text" },
  audioUrl:     String,
  audioDuration:Number,
  fileUrl:      String,
  fileName:     String,
  fileSize:     Number,
  templateType: String,
  isTranslated: Boolean,
  originalText: String,
  translatedText:String,
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isDeleted: { type: Boolean, default: false },
  reactions: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reaction: String,
    emoji: String
  }]
}, { timestamps: true });

export const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
