import React from "react";
import { Message } from "../../context/ChatContext";
import { format } from "date-fns";
import { Check, CheckCheck, File, Download, ShieldCheck } from "lucide-react";
import { useSocket } from "../../hooks/useSocket";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMe }) => {
  const { onlineUsers } = useSocket();
  const isRead = message.readBy.length > 1;
  const isDelivered = message.deliveredTo?.length > 1;
  
  if (message.messageType === "system") {
    return (
      <div className="flex justify-center my-4">
        <span className="text-[10px] font-bold bg-stone-100 text-stone-500 px-4 py-2 rounded-full shadow-sm border border-stone-200 uppercase tracking-widest">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4 group`}>
      <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
        {message.isDeleted ? (
          <div className={`px-4 py-2.5 rounded-2xl shadow-sm italic text-stone-400 text-sm ${isMe ? "bg-stone-100 rounded-tr-sm" : "bg-white border border-stone-200 rounded-tl-sm"}`}>
            This message was deleted
          </div>
        ) : (
          <div className="relative">
            {message.messageType === "text" && (
              <div className={`px-4 py-3 rounded-2xl shadow-sm transition-all ${isMe ? "bg-emerald-600 text-white rounded-tr-sm" : "bg-white border border-stone-200 text-stone-800 rounded-tl-sm"}`}>
                <p className="text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
              </div>
            )}
            {message.messageType === "image" && (
              <div className={`rounded-2xl overflow-hidden shadow-md border-2 transition-transform hover:scale-[1.02] ${isMe ? "border-emerald-600/20" : "border-stone-200"}`}>
                <img src={message.image} alt="Sent image" className="max-w-full max-h-80 object-cover cursor-pointer" onClick={() => window.open(message.image, "_blank")} />
              </div>
            )}
            {message.messageType === "file" && (
              <div className={`flex items-center gap-4 p-4 rounded-2xl shadow-sm border transition-all ${isMe ? "bg-emerald-700 border-emerald-500 text-white" : "bg-white border-stone-200 text-stone-800"}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isMe ? "bg-emerald-600" : "bg-stone-100"}`}>
                  <File className={`w-6 h-6 ${isMe ? "text-emerald-100" : "text-stone-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{message.text}</p>
                  <p className={`text-[10px] uppercase tracking-tighter ${isMe ? "text-emerald-300" : "text-stone-400"}`}>Attached File</p>
                </div>
                <button onClick={() => window.open(message.image, "_blank")} className={`p-2.5 rounded-xl transition-colors ${isMe ? "hover:bg-emerald-600 text-emerald-100" : "hover:bg-stone-100 text-stone-500"}`}>
                  <Download className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
        <div className={`flex items-center gap-1.5 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">
            {format(new Date(message.createdAt), "HH:mm")}
          </span>
          {isMe && (
            <div className="flex items-center">
              {message._id.startsWith('temp-') ? (
                <span className="text-[9px] text-stone-400 font-bold uppercase tracking-tighter animate-pulse">Sending...</span>
              ) : isRead ? (
                <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
              ) : isDelivered ? (
                <CheckCheck className="w-3.5 h-3.5 text-stone-400" />
              ) : (
                <Check className="w-3.5 h-3.5 text-stone-400" />
              )}
            </div>
          )}
          {!isMe && (
            <div className="flex items-center gap-1 text-[9px] text-stone-300 font-bold uppercase tracking-widest">
              <ShieldCheck className="w-2.5 h-2.5" />
              Secure
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
