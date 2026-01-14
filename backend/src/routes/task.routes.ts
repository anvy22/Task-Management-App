import express from "express";
import {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
} from "../controllers/task.controller";
import { firebaseAuth } from "../middlewares/firebaseAuth";
import { authorize } from "../middlewares/rbac";

const router = express.Router();

router.use(firebaseAuth);


router.post("/", authorize(["admin", "user"]), createTask);
router.get("/", authorize(["admin", "user"]), getTasks);
router.patch("/:id", authorize(["admin", "user"]), updateTask);
router.delete("/:id", authorize(["admin", "user"]), deleteTask);

export default router;
