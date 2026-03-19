import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
    const newSocket = io(backendUrl);
    setSocket(newSocket);

    newSocket.on('notification', (notif: any) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      if (notif.priority === 'high' || notif.priority === 'urgent') {
        // toast.custom(<NotificationToast notif={notif} />) // Need to implement NotificationToast
      }
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const markRead = async (id: string) => {
    try {
      await axiosInstance.put(`/notifications/read/${id}`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, 'channels.inApp.read': true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  return { notifications, unreadCount, markRead };
};
