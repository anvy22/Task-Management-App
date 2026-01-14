import { Router } from "express";
import { firebaseAuth } from "../middlewares/firebaseAuth";
import { authorize } from "../middlewares/rbac";
import { getActivity } from "../controllers/activity.controller";

const router = Router();

router.use(firebaseAuth);
router.get("/:id/activity", authorize(["admin", "user"]), getActivity);

export default router;
