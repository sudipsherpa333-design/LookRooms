import { useEffect, useState } from "react";
import { useChatContext } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { encryptMessage } from "../utils/encryption";
import { useSocketContext } from "../context/SocketContext";
import axiosInstance from "../api/axiosInstance";

export const useChat = () => {
  const { state, dispatch } = useChatContext();
  const { user } = useAuth();
  const { socket } = useSocketContext();
  const [loading, setLoading] = useState(false);

  const fetchConversations = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.get("/conversations", {
        headers: { "x-user-id": user.id || user._id || "" },
      });
      if (res.status === 200) {
        const data = res.data;
        const userId = user.id || user._id || "";
        dispatch({ type: "SET_CONVERSATIONS", payload: data, userId });
        
        // Mark as delivered for all unread conversations
        data.forEach((conv: any) => {
          if (conv.lastMessage && !conv.lastMessage.readBy.includes(userId) && !conv.lastMessage.deliveredTo?.includes(userId)) {
            socket?.emit("markDelivered", { conversationId: conv._id });
          }
        });
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  };

  const fetchMessages = async (conversationId: string, page = 1) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/messages/${conversationId}?page=${page}&limit=20`, {
        headers: { "x-user-id": user.id || user._id || "" },
      });
      if (res.status === 200) {
        const data = res.data;
        dispatch({ type: "SET_MESSAGES", payload: data });
        socket?.emit("markRead", { conversationId });
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (conversationId: string, text: string, image?: string) => {
    if (!user || !socket) return;
    
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      conversationId,
      sender: {
        _id: user.id || user._id,
        name: user.name,
        avatar: (user as any).avatar,
        role: user.role
      },
      text,
      image,
      messageType: image ? "image" : "text",
      readBy: [user.id || user._id],
      deliveredTo: [user.id || user._id],
      isDeleted: false,
      createdAt: new Date().toISOString()
    };
    
    dispatch({ type: "ADD_MESSAGE", payload: optimisticMessage as any });

    try {
      const encryptedText = text ? encryptMessage(text, conversationId) : text;
      socket.emit("sendMessage", {
        conversationId,
        senderId: user.id || user._id,
        text: encryptedText,
        image,
        messageType: image ? "image" : "text",
        tempId
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (!user) return;
    try {
      await axiosInstance.put(`/messages/read/${conversationId}`, {}, {
        headers: { "x-user-id": user.id || user._id || "" },
      });
      dispatch({ type: "MARK_READ", payload: { conversationId, userId: user.id || user._id || "" } });
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  return {
    conversations: state.conversations,
    activeConversation: state.activeConversation,
    messages: state.messages,
    typingStatus: state.typingStatus,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
    setActiveConversation: (conv: any) => dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: conv }),
  };
};
