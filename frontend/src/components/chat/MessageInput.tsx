import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../../hooks/useChat";
import { useSocketContext } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { Send, Image as ImageIcon, Paperclip, X } from "lucide-react";

interface MessageInputProps {
  conversationId: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ conversationId }) => {
  const { sendMessage } = useChat();
  const { socket } = useSocketContext();
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = () => {
    if (!socket || !user) return;
    socket.emit("typing", { conversationId, userId: user.id || user._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { conversationId, userId: user.id || user._id });
    }, 2000);
  };

  const handleSend = () => {
    if (!text.trim() && !image) return;
    sendMessage(conversationId, text, image || undefined);
    setText("");
    setImage(null);
    if (socket && user) {
      socket.emit("stopTyping", { conversationId, userId: user.id || user._id });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 bg-white border-t border-stone-200 shrink-0 z-10">
      {image && (
        <div className="mb-3 relative inline-block">
          <img src={image} alt="Preview" className="h-24 rounded-xl border border-stone-200 object-cover" />
          <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-white text-stone-500 hover:text-red-500 rounded-full p-1 shadow-md border border-stone-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2 bg-stone-100 rounded-2xl p-2 md:p-3 border border-stone-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all shadow-sm">
        <button onClick={() => fileInputRef.current?.click()} className="p-2 md:p-2.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors shrink-0">
          <ImageIcon className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); handleTyping(); }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 px-2 text-stone-800 placeholder-stone-400 text-sm md:text-base"
          rows={1}
        />
        <button onClick={handleSend} disabled={!text.trim() && !image} className="p-2 md:p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 shadow-sm">
          <Send className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
    </div>
  );
};
