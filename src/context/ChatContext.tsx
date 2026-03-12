import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { useSocketContext } from "./SocketContext";
import { useAuth } from "./AuthContext";
import { decryptMessage } from "../utils/encryption";

export interface ChatUser {
  _id: string;
  name: string;
  avatar?: string;
  role: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: ChatUser;
  text: string;
  image?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  messageType: "text" | "image" | "file" | "system";
  readBy: string[];
  deliveredTo: string[];
  isDeleted: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: ChatUser[];
  roomListing?: any;
  lastMessage?: Message;
  isArchived: boolean;
  updatedAt: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  unreadCount: number;
  typingStatus: { [conversationId: string]: string[] }; // userId array
}

type ChatAction =
  | { type: "SET_CONVERSATIONS"; payload: Conversation[]; userId: string }
  | { type: "SET_ACTIVE_CONVERSATION"; payload: Conversation | null }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_MESSAGES"; payload: Message[] }
  | { type: "UPDATE_MESSAGE"; payload: Message }
  | { type: "SET_TYPING"; payload: { conversationId: string; userId: string; isTyping: boolean } }
  | { type: "MARK_READ"; payload: { conversationId: string; userId: string } }
  | { type: "MARK_DELIVERED"; payload: { conversationId: string; userId: string } }
  | { type: "INCREMENT_UNREAD" };

const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  unreadCount: 0,
  typingStatus: {},
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "SET_CONVERSATIONS": {
      const decryptedConversations = action.payload.map(conv => {
        if (conv.lastMessage && conv.lastMessage.messageType === 'text') {
          return {
            ...conv,
            lastMessage: {
              ...conv.lastMessage,
              text: decryptMessage(conv.lastMessage.text, conv._id)
            }
          };
        }
        return conv;
      });
      const unreadCount = decryptedConversations.reduce((count, conv) => {
        if (conv.lastMessage && !conv.lastMessage.readBy.includes(action.userId)) {
          // If not read, at least mark as delivered
          if (!conv.lastMessage.deliveredTo?.includes(action.userId)) {
            // We can't emit from reducer, but we can track it or rely on the effect
          }
          return count + 1;
        }
        return count;
      }, 0);
      return { ...state, conversations: decryptedConversations, unreadCount };
    }
    case "SET_ACTIVE_CONVERSATION":
      return { ...state, activeConversation: action.payload };
    case "SET_MESSAGES": {
      const decryptedMessages = action.payload.map(msg => {
        if (msg.messageType === 'text') {
          return { ...msg, text: decryptMessage(msg.text, msg.conversationId) };
        }
        return msg;
      });
      return { ...state, messages: decryptedMessages };
    }
    case "ADD_MESSAGE": {
      const decryptedMessage = action.payload.messageType === 'text' 
        ? { ...action.payload, text: decryptMessage(action.payload.text, action.payload.conversationId) }
        : action.payload;

      const tempId = (action.payload as any).tempId;
      const isExisting = state.messages.some((m) => m._id === decryptedMessage._id || (tempId && m._id === tempId));
      
      const updatedConversations = state.conversations.map((conv) => {
        if (conv._id === decryptedMessage.conversationId) {
          return { ...conv, lastMessage: decryptedMessage, updatedAt: decryptedMessage.createdAt };
        }
        return conv;
      });

      // Sort conversations by updatedAt
      updatedConversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      if (isExisting) {
        return { 
          ...state, 
          conversations: updatedConversations,
          messages: state.messages.map(m => (m._id === decryptedMessage._id || (tempId && m._id === tempId)) ? decryptedMessage : m)
        };
      }
      
      return { 
        ...state, 
        messages: [...state.messages, decryptedMessage],
        conversations: updatedConversations
      };
    }
    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m._id === action.payload._id ? action.payload : m
        ),
      };
    case "SET_TYPING": {
      const { conversationId, userId, isTyping } = action.payload;
      const currentTyping = state.typingStatus[conversationId] || [];
      const newTyping = isTyping
        ? [...new Set([...currentTyping, userId])]
        : currentTyping.filter((id) => id !== userId);
      return {
        ...state,
        typingStatus: { ...state.typingStatus, [conversationId]: newTyping },
      };
    }
    case "MARK_READ": {
      const { conversationId, userId } = action.payload;
      let wasUnread = false;

      const updatedConversations = state.conversations.map((conv) => {
        if (conv._id === conversationId && conv.lastMessage && !conv.lastMessage.readBy.includes(userId)) {
          wasUnread = true;
          return {
            ...conv,
            lastMessage: {
              ...conv.lastMessage,
              readBy: [...new Set([...conv.lastMessage.readBy, userId])],
              deliveredTo: [...new Set([...(conv.lastMessage.deliveredTo || []), userId])],
            },
          };
        }
        return conv;
      });

      return {
        ...state,
        conversations: updatedConversations,
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        messages: state.messages.map((m) => {
          if (m.conversationId === conversationId && !m.readBy.includes(userId)) {
            return { 
              ...m, 
              readBy: [...new Set([...m.readBy, userId])],
              deliveredTo: [...new Set([...(m.deliveredTo || []), userId])]
            };
          }
          return m;
        }),
      };
    }
    case "MARK_DELIVERED": {
      const { conversationId, userId } = action.payload;
      return {
        ...state,
        conversations: state.conversations.map((conv) => {
          if (conv._id === conversationId && conv.lastMessage && !conv.lastMessage.deliveredTo?.includes(userId)) {
            return {
              ...conv,
              lastMessage: {
                ...conv.lastMessage,
                deliveredTo: [...new Set([...(conv.lastMessage.deliveredTo || []), userId])],
              },
            };
          }
          return conv;
        }),
        messages: state.messages.map((m) => {
          if (m.conversationId === conversationId && !m.deliveredTo?.includes(userId)) {
            return { ...m, deliveredTo: [...new Set([...(m.deliveredTo || []), userId])] };
          }
          return m;
        }),
      };
    }
    case "INCREMENT_UNREAD":
      return { ...state, unreadCount: state.unreadCount + 1 };
    default:
      return state;
  }
};

const ChatContext = createContext<{
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
}>({ state: initialState, dispatch: () => null });

export const useChatContext = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { socket } = useSocketContext();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (message: any) => {
      dispatch({ type: "ADD_MESSAGE", payload: message });
      if (state.activeConversation?._id !== message.conversationId) {
        dispatch({ type: "INCREMENT_UNREAD" });
        socket.emit("markDelivered", { conversationId: message.conversationId });
      } else {
        socket.emit("markRead", { conversationId: message.conversationId });
      }
    };

    const handleDisplayTyping = ({ conversationId, userId }: any) => {
      dispatch({ type: "SET_TYPING", payload: { conversationId, userId, isTyping: true } });
    };

    const handleHideTyping = ({ conversationId, userId }: any) => {
      dispatch({ type: "SET_TYPING", payload: { conversationId, userId, isTyping: false } });
    };

    const handleMessageRead = ({ conversationId, userId }: any) => {
      dispatch({ type: "MARK_READ", payload: { conversationId, userId } });
    };

    const handleMessageDelivered = ({ conversationId, userId }: any) => {
      dispatch({ type: "MARK_DELIVERED", payload: { conversationId, userId } });
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("displayTyping", handleDisplayTyping);
    socket.on("hideTyping", handleHideTyping);
    socket.on("messageRead", handleMessageRead);
    socket.on("messageDelivered", handleMessageDelivered);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("displayTyping", handleDisplayTyping);
      socket.off("hideTyping", handleHideTyping);
      socket.off("messageRead", handleMessageRead);
      socket.off("messageDelivered", handleMessageDelivered);
    };
  }, [socket, user, state.activeConversation]);

  useEffect(() => {
    if (socket && state.conversations.length > 0) {
      state.conversations.forEach((conv) => {
        socket.emit("joinRoom", conv._id);
      });
    }
  }, [socket, state.conversations]);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
