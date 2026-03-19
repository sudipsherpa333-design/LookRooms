import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ChatSidebar } from "../components/chat/ChatSidebar";
import { ChatWindow } from "../components/chat/ChatWindow";
import { useChat } from "../hooks/useChat";

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fetchConversations } = useChat();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchConversations();
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
      <ChatSidebar />
      <ChatWindow />
    </div>
  );
}
