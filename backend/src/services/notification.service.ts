import { Notification } from "../models/Notification.model";
import { emitToUser } from "./socketEvents";
import { Types } from "mongoose";

interface CreateNotificationParams {
    recipientId: string;
    recipientFirebaseUid: string;
    type: string;
    title: string;
    message: string;
    refType?: "ticket" | "comment";
    refId?: Types.ObjectId;
    actorId?: Types.ObjectId | string;
    metadata?: Record<string, any>;
}


export const createNotification = async (params: CreateNotificationParams) => {

    const notification = await Notification.create({
        recipient: params.recipientId,
        type: params.type,
        title: params.title,
        message: params.message,
        refType: params.refType,
        refId: params.refId,
        actor: params.actorId,
        metadata: params.metadata,
    });

    emitToUser(params.recipientFirebaseUid, "notification:new", notification);

    return notification;

};

export const getUserNotifications = async (
    userId: string,
    options: {
        limit?: number;
        skip?: number;
        unreadOnly?: boolean;
    } = {}
) => {
    const query: any = { recipient: userId };

    if (options.unreadOnly) {
        query.isRead = false;
    }

    return Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 20)
        .skip(options.skip || 0)
        .populate("actor", "name email");
};

export const markAsRead = async (notificationId: string, userId: string) => {
    return Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isRead: true },
        { new: true }
    );
};

export const markAllAsRead = async (userId: string) => {
    return Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
    );
};

export const getUnreadCount = async (userId: string) => {
    return Notification.countDocuments({ recipient: userId, isRead: false });
};

export const deleteNotification = async (notificationId: string, userId: string) => {
    return Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
};

export const deleteAllNotifications = async (userId: string) => {
    return Notification.deleteMany({ recipient: userId });
};
