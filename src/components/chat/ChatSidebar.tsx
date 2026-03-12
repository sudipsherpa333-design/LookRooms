import React, { useState } from "react";
import { useChat } from "../../hooks/useChat";
import { useSocket } from "../../hooks/useSocket";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { Check, CheckCheck } from "lucide-react";

export const ChatSidebar: React.FC = () => {
  const { conversations, activeConversation, setActiveConversation, typingStatus } = useChat();
  const { onlineUsers } = useSocket();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const filteredConversations = conversations.filter((c) => {
    const otherUser = c.participants.find((p) => p._id !== (user?.id || user?._id));
    return otherUser?.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-stone-200 flex flex-col h-full bg-white">
      <div className="p-4 border-b border-stone-200">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Messages</h2>
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 bg-stone-100 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 text-sm"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-stone-500">No conversations found.</div>
        ) : (
          filteredConversations.map((chat) => {
            const otherUser = chat.participants.find((p) => p._id !== (user?.id || user?._id));
            const isActive = activeConversation?._id === chat._id;
            const isOnline = onlineUsers.includes(otherUser?._id || "");
            const isTyping = typingStatus[chat._id]?.includes(otherUser?._id || "");
            const unread = chat.lastMessage && 
                          chat.lastMessage.sender._id !== (user?.id || user?._id) && 
                          !chat.lastMessage.readBy?.includes(user?.id || user?._id || "");

            return (
              <button
                key={chat._id}
                onClick={() => setActiveConversation(chat)}
                className={`w-full text-left p-4 border-b border-stone-100 hover:bg-stone-50 transition-colors flex items-center gap-3 ${isActive ? 'bg-emerald-50/50' : ''}`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
                    {otherUser?.avatar ? (
                      <img src={otherUser.avatar} alt={otherUser.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      otherUser?.name?.charAt(0) || "?"
                    )}
                  </div>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold truncate ${unread ? 'text-stone-900' : 'text-stone-700'}`}>
                        {otherUser?.name || "Unknown User"}
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded-md uppercase tracking-wider font-medium">
                        {otherUser?.role === 'homeowner' ? 'Owner' : 'Seeker'}
                      </span>
                    </div>
                    {chat.lastMessage && (
                      <div className="flex items-center gap-1">
                        {chat.lastMessage.sender._id === (user?.id || user?._id) && (
                          <div className="flex items-center">
                            {chat.lastMessage.readBy?.length > 1 ? (
                              <CheckCheck className="w-3 h-3 text-emerald-500" />
                            ) : chat.lastMessage.deliveredTo?.length > 1 ? (
                              <CheckCheck className="w-3 h-3 text-stone-400" />
                            ) : (
                              <Check className="w-3 h-3 text-stone-400" />
                            )}
                          </div>
                        )}
                        <span className="text-xs text-stone-400 shrink-0">
                          {format(new Date(chat.lastMessage.createdAt), 'MMM d')}
                        </span>
                      </div>
                    )}
                  </div>
                  {isTyping ? (
                    <p className="text-sm font-medium text-emerald-600 italic">typing...</p>
                  ) : (
                    <p className={`text-sm truncate ${unread ? 'font-medium text-stone-900' : 'text-stone-500'}`}>
                      {chat.lastMessage ? (
                        chat.lastMessage.messageType === 'image' ? 'Sent an image' : chat.lastMessage.text
                      ) : (
                        "Start a conversation"
                      )}
                    </p>
                  )}
                </div>
                {unread && (
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0"></div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
