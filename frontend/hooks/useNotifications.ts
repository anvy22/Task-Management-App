"use client";

import { useSocket, Notification } from "@/components/providers/SocketProvider";

export type { Notification };

export function useNotifications() {
    const {
        notifications,
        notificationsLoading,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
    } = useSocket();

    return {
        notifications,
        isLoading: notificationsLoading,
        unreadCount,
        refresh: fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
    };
}
