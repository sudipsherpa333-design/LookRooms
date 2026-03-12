import { useChatContext } from "../context/ChatContext";

export const useUnreadCount = () => {
  const { state } = useChatContext();
  return state.unreadCount;
};
