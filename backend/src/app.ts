import express from "express";
import cors from "cors";
import authRoutes from "../src/routes/auth.routes"
import ticketRoutes from "./routes/ticket.routes";
import commentRoutes from "./routes/comment.routes";
import activityRoutes from "./routes/activity.routes";
import userRoutes from "./routes/user.routes"
import taskRoutes from "./routes/task.routes";

const app = express();

app.use(cors());
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