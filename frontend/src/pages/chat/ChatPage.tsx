import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useChatContext } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useSocketContext } from '../../context/SocketContext';
import { Send, Image as ImageIcon, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { state, dispatch } = useChatContext();
  const { user } = useAuth();
  const { socket } = useSocketContext();
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: state.conversations.find(c => c._id === conversationId) || null });
      socket?.emit('markRead', { conversationId });
    }
    return () => {
      dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: null });
    };
  }, [conversationId, state.conversations, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  const handleSend = () => {
    if (!text.trim() || !socket || !conversationId) return;
    
    const tempId = Date.now().toString();
    const message = {
      _id: tempId,
      conversationId,
      sender: user,
      text,
      messageType: 'text',
      createdAt: new Date().toISOString(),
      readBy: [],
      deliveredTo: [],
      isDeleted: false
    };
    
    dispatch({ type: "ADD_MESSAGE", payload: message as any });
    socket.emit('sendMessage', { conversationId, text, tempId, messageType: 'text' });
    setText('');
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    socket?.emit('typing', { conversationId, userId: user?._id });
    // Debounce stop typing
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !socket || !conversationId) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await axiosInstance.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const message = {
        conversationId,
        sender: user?._id,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        messageType: 'file',
        createdAt: new Date().toISOString(),
      };

      socket.emit('sendMessage', message);
      dispatch({ type: "ADD_MESSAGE", payload: message as any });
    } catch (error) {
      console.error('Upload failed', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f]">
      {/* Header */}
      <div className="p-4 border-b border-[#1e1e2e] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1e1e2e]" />
          <div>
            <h3 className="font-bold">Chat</h3>
            <p className="text-xs text-emerald-500">Online</p>
          </div>
        </div>
        <div className="flex gap-4 text-[#94a3b8]">
          <Phone className="w-5 h-5" />
          <Video className="w-5 h-5" />
          <MoreVertical className="w-5 h-5" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {state.messages.filter(m => m.conversationId === conversationId).map((msg) => (
          <div key={msg._id} className={`flex ${msg.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-2xl ${msg.sender._id === user?._id ? 'bg-[#6366f1] text-white' : 'bg-[#1e1e2e] text-[#f1f5f9]'}`}>
              {msg.text}
              {msg.fileUrl && (
                msg.fileName?.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                  <img src={msg.fileUrl} alt={msg.fileName} className="max-w-full rounded-lg mt-2" />
                ) : (
                  <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="block text-blue-300 underline text-sm mt-1">
                    {msg.fileName} ({Math.round((msg.fileSize || 0) / 1024)} KB)
                  </a>
                )
              )}
              <span className="text-[10px] opacity-70 block mt-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-[#1e1e2e] flex items-center gap-2">
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        <Paperclip className="w-6 h-6 text-[#94a3b8] cursor-pointer" onClick={() => fileInputRef.current?.click()} />
        <ImageIcon className="w-6 h-6 text-[#94a3b8] cursor-pointer" onClick={() => fileInputRef.current?.click()} />
        <input
          value={text}
          onChange={handleTyping}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-[#12121a] rounded-full px-4 py-2 text-sm focus:outline-none"
          placeholder="Type a message..."
        />
        <button onClick={handleSend} className="bg-[#6366f1] p-2 rounded-full text-white">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
