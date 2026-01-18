import { Server } from "socket.io";
import { getUserSocket } from "./socket.service";


let ioInstance: Server | null;

export const initializeSocket = (io: Server) => {
  ioInstance = io;
}

export const emitToUser = (userId: string, event: string, data: any) => {

  if (!ioInstance) {
    console.error("Failed to initialise the io instance");
  }

  const socketId = getUserSocket(userId)
  if (socketId) {
    ioInstance?.to(socketId).emit(event, data);
    console.log(`${event} → user ${userId}`);
  } else {
    console.log("Failed to emit message in emitToUser");
  }

}

export const emitToAll = (event: string, data: any) => {
  if (!ioInstance) {
    console.error("Failed to initialise the io instance");
    return;
  }
  ioInstance.emit(event, data);
  console.log(`${event} → all users`);
};
