import express from "express";
import cors from "cors";
import morgan from "morgan"
import fs from "fs"
import path from "path"
import authRoutes from "../src/routes/auth.routes"
import ticketRoutes from "../src/routes/ticket.routes";
import commentRoutes from "./routes/comment.routes";
import activityRoutes from "./routes/activity.routes";
import userRoutes from "./routes/user.routes"
import taskRoutes from "./routes/task.routes";
import type { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { socketAuth } from "./middlewares/socketAuth"
import { removeUserSocket } from "./services/socket.service";
import type { AuthenticatedSocket } from "./types/socket";
import { initializeSocket, emitToAll } from "./services/socketEvents";
import notificationRoutes from "./routes/notification.routes";

const app = express();
app.use(cors());
app.set("trust proxy", true);


const logsDir = path.join(process.cwd(), "src", "logs");

const logFormat =
  ":date[iso] :remote-addr :method :url :status :response-time ms";

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const infoStream = fs.createWriteStream(
  path.join(logsDir, "info.txt"),
  { flags: "a" }
);

const errorStream = fs.createWriteStream(
  path.join(logsDir, "error.txt"),
  { flags: "a" }
)


app.use(
  morgan(logFormat, {
    stream: infoStream,
    skip: (_req: Request, res: Response) => res.statusCode >= 400,
  })
);

app.use(
  morgan(logFormat, {
    stream: errorStream,
    skip: (_req: Request, res: Response) => res.statusCode < 400,
  })
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/tickets", ticketRoutes);
app.use("/tickets", commentRoutes);
app.use("/tickets", activityRoutes);
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);
app.use("/notifications", notificationRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.use(socketAuth);

initializeSocket(io);

io.on("connection", (socket: AuthenticatedSocket) => {
  console.log(`User ${socket.userId} connected via websocket`);


  emitToAll("user:online", { userId: socket.userId });

  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`);
    emitToAll("user:offline", { userId: socket.userId });
    removeUserSocket(socket.userId!);
  });
})

export { app, io, server };