import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../../hooks/useChat";
import { useSocket } from "../../hooks/useSocket";
import { useSocketContext } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { format, isToday, isYesterday } from "date-fns";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ArrowLeft, MoreVertical, Search, User, MessageCircle, ShieldCheck, ChevronDown } from "lucide-react";

export const ChatWindow: React.FC = () => {
  const { activeConversation, messages, fetchMessages, setActiveConversation, typingStatus } = useChat();
  const { onlineUsers } = useSocket();
  const { socket } = useSocketContext();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeConversation && socket) {
      socket.emit("joinRoom", activeConversation._id);
      socket.emit("markRead", { conversationId: activeConversation._id });
      fetchMessages(activeConversation._id);
    }
    return () => {
      if (activeConversation && socket) {
        socket.emit("leaveRoom", activeConversation._id);
      }
    };
  }, [activeConversation?._id, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingStatus]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollBottom(!isAtBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-stone-50/50 text-stone-400 p-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-stone-900 mb-2">Your Messages</h3>
        <p className="max-w-md">Select a conversation from the sidebar or start a new one to begin chatting.</p>
      </div>
    );
  }

  const otherUser = activeConversation.participants.find((p) => p._id !== (user?.id || user?._id));
  const isOnline = onlineUsers.includes(otherUser?._id || "");
  const isTyping = typingStatus[activeConversation._id]?.includes(otherUser?._id || "");

  return (
    <div className="flex-1 flex flex-col bg-stone-50/50 h-full">
      {/* Header */}
      <div className="h-16 border-b border-stone-200 bg-white flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveConversation(null)}
            className="md:hidden p-2 -ml-2 text-stone-500 hover:text-stone-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              {otherUser?.avatar ? (
                <img src={otherUser.avatar} alt={otherUser.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                otherUser?.name?.charAt(0) || "?"
              )}
            </div>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-stone-900">{otherUser?.name || "Unknown User"}</h3>
              <span className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded-md uppercase tracking-wider font-medium">
                {otherUser?.role === 'homeowner' ? 'Owner' : 'Seeker'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-stone-500">
                {isOnline ? "Online" : otherUser?.lastSeen ? `Last seen ${format(new Date(otherUser.lastSeen), 'MMM d, HH:mm')}` : "Offline"}
              </p>
              <span className="text-stone-300">•</span>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>Encrypted</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
            <User className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative"
      >
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            Messages are end-to-end encrypted
          </div>
        </div>
        {messages.length === 0 ? (
          <div className="text-center text-stone-500 mt-10">Start the conversation about this room</div>
        ) : (
          messages.map((msg, index) => {
            const prevMsg = messages[index - 1];
            const showDate = !prevMsg || new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
            
            return (
              <React.Fragment key={msg._id}>
                {showDate && (
                  <div className="flex justify-center my-6">
                    <span className="text-xs font-medium bg-stone-200/50 text-stone-500 px-3 py-1 rounded-full">
                      {isToday(new Date(msg.createdAt)) ? 'Today' : isYesterday(new Date(msg.createdAt)) ? 'Yesterday' : format(new Date(msg.createdAt), 'MMMM d, yyyy')}
                    </span>
                  </div>
                )}
                <MessageBubble message={msg} isMe={msg.sender._id === (user?.id || user?._id)} />
              </React.Fragment>
            );
          })
        )}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
              <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
        
        {showScrollBottom && (
          <button 
            onClick={scrollToBottom}
            className="sticky bottom-4 left-1/2 -translate-x-1/2 bg-white text-emerald-600 p-3 rounded-full shadow-xl border border-stone-100 hover:bg-stone-50 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300 z-20"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Input */}
      <MessageInput conversationId={activeConversation._id} />
    </div>
  );
};
