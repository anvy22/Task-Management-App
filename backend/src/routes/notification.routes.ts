import { Router } from "express";
import { firebaseAuth } from "../middlewares/firebaseAuth";
import {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    deleteAllNotifications
} from "../controllers/notification.controller";

const router = Router();


router.use(firebaseAuth);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadNotificationCount);


router.put("/all", markAllNotificationsRead);
router.put("/:id", markNotificationRead);
router.delete("/all", deleteAllNotifications);
router.delete("/:id", deleteNotification);

export default router;