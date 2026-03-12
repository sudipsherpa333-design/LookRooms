import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(window.location.origin);
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
    await fetch(`/api/v1/notifications/read/${id}`, { method: 'PUT' });
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, 'channels.inApp.read': true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return { notifications, unreadCount, markRead };
};
