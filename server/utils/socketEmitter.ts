import { Server } from 'socket.io';

let io: Server;

export const setIo = (socketIo: Server) => {
  io = socketIo;
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(userId.toString()).emit(event, data);
  }
};
