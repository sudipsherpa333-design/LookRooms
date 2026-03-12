import React from "react";
import { useUnreadCount } from "../../hooks/useUnreadCount";
import { MessageSquare } from "lucide-react";

export const ChatNotificationBadge: React.FC<{ className?: string }> = ({ className }) => {
  const unreadCount = useUnreadCount();

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <MessageSquare className="w-full h-full" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  );
};
