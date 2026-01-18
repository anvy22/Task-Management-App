import { Router } from "express";
import { firebaseAuth } from "../middlewares/firebaseAuth";
import { authorize } from "../middlewares/rbac";
import { addComment, getComments, deleteComment } from "../controllers/comment.controller";

const router = Router();

router.use(firebaseAuth);
router.post("/:id/comments", authorize(["admin", "user"]), addComment);
router.get("/:id/comments", authorize(["admin", "user"]), getComments);
router.delete("/:ticketId/comments/:commentId", authorize(["admin", "user"]), deleteComment);

export default router;
