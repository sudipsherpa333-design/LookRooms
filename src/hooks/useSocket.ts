import { useSocketContext } from "../context/SocketContext";

export const useSocket = () => {
  const { onlineUsers } = useSocketContext();
  return { onlineUsers };
};
