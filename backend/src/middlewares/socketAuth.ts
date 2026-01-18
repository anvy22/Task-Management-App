import admin from "../config/firebase";
import { addUserSocket } from "../services/socket.service";
import { Socket } from "socket.io";
import type { DecodedIdToken } from "firebase-admin/auth";

interface AuthSocket extends Socket {
    user?: DecodedIdToken;
    userId?: string;
}

export const socketAuth = async (socket: AuthSocket, next: (err?: Error) => void) => {
    console.log(`[SocketAuth] Connection attempt from ${socket.id}`);

    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

    if (!token) {
        const error = new Error("No token provided");
        console.warn("[SocketAuth] No token provided");
        return next(error);
    }

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        console.log(`[socketAuth] Token verified for the UID: ${decoded.uid}`);

        socket.user = decoded;
        socket.userId = decoded.uid;

        addUserSocket(decoded.uid, socket.id);

        next();

    } catch (error) {
        console.log(`[socketAuth] Token verification failed`);
        const err = new Error("Invalid token");
        next(err);
    }
};
