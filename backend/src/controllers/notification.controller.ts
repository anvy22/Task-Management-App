import type { Response } from "express";
import type { AuthRequest } from "../middlewares/firebaseAuth";
import {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification as deleteNotificationService,
    deleteAllNotifications as deleteAllNotificationsService,
} from "../services/notification.service";

import { User } from "../models/User.model";

export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findOne({ firebaseUid: req.user?.uid });
        if (!user) return res.status(404).json({ error: "User not found" });
        const { limit, skip, unreadOnly } = req.query;
        const notifications = await getUserNotifications(user._id.toString(), {
            limit: Number(limit) || 20,
            skip: Number(skip) || 0,
            unreadOnly: unreadOnly === "true",
        });
        const unreadCount = await getUnreadCount(user._id.toString());
        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};


export const markNotificationRead = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!id || Array.isArray(id)) return res.status(400).json({ error: "Notification ID is required" });

        const user = await User.findOne({ firebaseUid: req.user?.uid });
        if (!user) return res.status(404).json({ error: "User not found" });
        const notification = await markAsRead(id, user._id.toString());
        if (!notification) return res.status(404).json({ error: "Notification not found" });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: "Failed to mark notification as read" });
    }
};


export const markAllNotificationsRead = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findOne({ firebaseUid: req.user?.uid });
        if (!user) return res.status(404).json({ error: "User not found" });
        await markAllAsRead(user._id.toString());
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ error: "Failed to mark notifications as read" });
    }
};


export const deleteNotification = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!id || Array.isArray(id)) return res.status(400).json({ error: "Notification ID is required" });

        const user = await User.findOne({ firebaseUid: req.user?.uid });
        if (!user) return res.status(404).json({ error: "User not found" });
        const notification = await deleteNotificationService(id, user._id.toString());
        if (!notification) return res.status(404).json({ error: "Notification not found" });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: "Failed to delete notification" });
    }
};


export const deleteAllNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findOne({ firebaseUid: req.user?.uid });
        if (!user) return res.status(404).json({ error: "User not found" });
        await deleteAllNotificationsService(user._id.toString());
        res.json({ message: "All notifications deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete notifications" });
    }
};


export const getUnreadNotificationCount = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findOne({ firebaseUid: req.user?.uid });
        if (!user) return res.status(404).json({ error: "User not found" });
        const count = await getUnreadCount(user._id.toString());
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: "Failed to get unread count" });
    }
};  