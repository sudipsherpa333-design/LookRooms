import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';

export const NotificationDropdown = () => {
  const { notifications, markRead } = useNotifications();

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold">Notifications</h3>
        <button className="text-sm text-blue-600">Mark all read</button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notif: any) => (
          <div 
            key={notif._id} 
            className={`p-4 border-b border-gray-100 cursor-pointer ${notif.channels.inApp.read ? 'bg-white' : 'bg-blue-50'}`}
            onClick={() => markRead(notif._id)}
          >
            <p className="font-medium text-sm">{notif.title}</p>
            <p className="text-xs text-gray-600">{notif.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
