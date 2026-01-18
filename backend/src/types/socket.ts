import { Socket } from "socket.io";
import type { AuthRequest } from "../middlewares/firebaseAuth";

export interface AuthenticatedSocket extends Socket{
    userId?:string,
    user?:AuthRequest["user"]
}