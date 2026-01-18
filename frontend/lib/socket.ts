"use client";

import { io, Socket } from "socket.io-client";
import { getAuth } from "firebase/auth";

let socket: Socket | null = null;

export const getSocket = async (): Promise<Socket> => {
    if (socket?.connected) return socket;

    const auth = getAuth();

    // Wait for auth state to be ready
    if (!auth.currentUser) {
        await new Promise<void>((resolve) => {
            const unsubscribe = auth.onAuthStateChanged(() => {
                unsubscribe();
                resolve();
            });
        });
    }

    const token = await auth.currentUser?.getIdToken();

    socket = io(process.env.NEXT_PUBLIC_API_URL!, {
        auth: { token: token },
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export { socket };
