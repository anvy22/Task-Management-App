import { Router } from "express";
import { firebaseAuth } from "../middlewares/firebaseAuth";
import { authorize } from "../middlewares/rbac";
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  reviewTicket,
  deleteTicket,
} from "../controllers/ticket.controller";

const router = Router();

router.use(firebaseAuth);

router.post("/", authorize(["admin"]), createTicket);
router.get("/", authorize(["admin", "user"]), getTickets);
router.get("/:id", authorize(["admin", "user"]), getTicketById);
router.patch("/:id/status", authorize(["admin", "user"]), updateTicketStatus);
router.patch("/:id/review", authorize(["admin"]), reviewTicket);
router.delete("/:id", authorize(["admin"]), deleteTicket);

export default router;

