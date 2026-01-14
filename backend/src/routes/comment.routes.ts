import { Router } from "express";
import { firebaseAuth } from "../middlewares/firebaseAuth";
import { authorize } from "../middlewares/rbac";
import { addComment, getComments } from "../controllers/comment.controller";

const router = Router();

router.use(firebaseAuth);
router.post("/:id/comments", authorize(["admin", "user"]), addComment);
router.get("/:id/comments", authorize(["admin", "user"]), getComments);


export default router;
