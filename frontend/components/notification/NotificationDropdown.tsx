"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, MessageSquare, Ticket, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, Notification } from "@/hooks/useNotifications";

export default function NotificationDropdown() {
    const router = useRouter();
    const {
        notifications,
        isLoading,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
    } = useNotifications();
    const [open, setOpen] = useState(false);

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }

        // Navigate based on notification type
        const ticketId = notification.metadata?.ticketId;
        if (ticketId) {
            router.push(`/dashboard/ticket/${ticketId}`);
            setOpen(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation();
        await deleteNotification(notificationId);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "comment:added":
            case "comment:replied":
                return <MessageSquare className="w-4 h-4 text-blue-500" />;
            case "ticket:assigned":
            case "ticket:updated":
            case "ticket:reviewed":
            case "ticket:deleted":
                return <Ticket className="w-4 h-4 text-green-500" />;
            default:
                return <Bell className="w-4 h-4 text-muted-foreground" />;
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-3 py-2">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={(e) => {
                                    e.preventDefault();
                                    markAllAsRead();
                                }}
                            >
                                <CheckCheck className="w-3 h-3 mr-1" />
                                Read all
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-destructive hover:text-destructive"
                                onClick={(e) => {
                                    e.preventDefault();
                                    deleteAllNotifications();
                                }}
                            >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Clear all
                            </Button>
                        )}
                    </div>
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-20">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
                            <Bell className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-accent group relative ${!notification.isRead ? "bg-primary/5" : ""
                                    }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="shrink-0 mt-0.5">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {notification.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        {formatTime(notification.createdAt)}
                                    </p>
                                </div>
                                <div className="shrink-0 flex items-center gap-1">
                                    {!notification.isRead && (
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => handleDelete(e, notification._id)}
                                    >
                                        <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
