import express from "express";
import cors from "cors";
import  morgan from "morgan"
import fs from "fs"
import path  from "path"
import authRoutes from "../src/routes/auth.routes"
import ticketRoutes from "./routes/ticket.routes";
import commentRoutes from "./routes/comment.routes";
import activityRoutes from "./routes/activity.routes";
import userRoutes from "./routes/user.routes"
import taskRoutes from "./routes/task.routes";
import type { Request, Response } from "express";

const app = express();
app.use(cors());
app.set("trust proxy", true);


const logsDir = path.join(process.cwd(),"src","logs");

const logFormat =
  ":date[iso] :remote-addr :method :url :status :response-time ms";

if(!fs.existsSync(logsDir)){
    fs.mkdirSync(logsDir,{ recursive:true});
}

const infoStream = fs.createWriteStream(
    path.join(logsDir,"info.txt"),
    { flags:"a" }
);

const errorStream = fs.createWriteStream(
    path.join(logsDir,"error.txt"),
    { flags:"a" }
)


app.use(
  morgan(logFormat, {
    stream: infoStream,
    skip: (_req:Request, res:Response) => res.statusCode >= 400,
  })
);

app.use(
  morgan(logFormat, {
    stream: errorStream,
    skip: (_req:Request, res:Response) => res.statusCode < 400,
  })
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/tickets", ticketRoutes);
app.use("/tickets", commentRoutes);
app.use("/tickets", activityRoutes);
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);

app.get("/heatlth", (req, res) => {
    res.json({ status: "OK" });
});




export default app;