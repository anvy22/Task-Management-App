"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import { Ticket } from "@/types/ticket";
import api from "@/lib/api";

export type Comment = {
    _id: string;
    ticketId: string;
    content: string;
    author: {
        _id: string;
        name: string;
    };
    replyTo?: {
        _id: string;
        content: string;
        author: {
            _id: string;
            name: string;
        };
    } | null;
    createdAt: string;
};

export type Notification = {
    _id: string;
    recipient: string;
    actor?: {
        _id: string;
        name: string;
        email?: string;
    };
    type: string;
    title: string;
    message: string;
    refType?: "ticket" | "comment";
    refId?: string;
    isRead: boolean;
    metadata?: {
        ticketId?: string;
        originalCommentId?: string;
    };
    createdAt: string;
};

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    onlineUsers: string[];
    // Tickets
    tickets: Ticket[];
    ticketsLoading: boolean;
    refreshTickets: () => Promise<void>;
    // Comments
    comments: Map<string, Comment[]>;
    commentsLoading: Map<string, boolean>;
    fetchComments: (ticketId: string) => Promise<void>;
    // Notifications
    notifications: Notification[];
    notificationsLoading: boolean;
    unreadCount: number;
    fetchNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    deleteAllNotifications: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    onlineUsers: [],
    tickets: [],
    ticketsLoading: true,
    refreshTickets: async () => { },
    comments: new Map(),
    commentsLoading: new Map(),
    fetchComments: async () => { },
    notifications: [],
    notificationsLoading: true,
    unreadCount: 0,
    fetchNotifications: async () => { },
    markAsRead: async () => { },
    markAllAsRead: async () => { },
    deleteNotification: async () => { },
    deleteAllNotifications: async () => { },
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [ticketsLoading, setTicketsLoading] = useState(true);
    const [comments, setComments] = useState<Map<string, Comment[]>>(new Map());
    const [commentsLoading, setCommentsLoading] = useState<Map<string, boolean>>(new Map());
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();

    // Fetch tickets initially
    const refreshTickets = useCallback(async () => {
        try {
            setTicketsLoading(true);
            const res = await api.get("/tickets");
            setTickets(res.data);
        } catch (err) {
            console.error("Failed to fetch tickets", err);
        } finally {
            setTicketsLoading(false);
        }
    }, []);

    // Fetch comments for a specific ticket
    const fetchComments = useCallback(async (ticketId: string) => {
        try {
            setCommentsLoading(prev => new Map(prev).set(ticketId, true));
            const res = await api.get(`/tickets/${ticketId}/comments`);
            setComments(prev => new Map(prev).set(ticketId, res.data));
        } catch (err) {
            console.error("Failed to fetch comments", err);
        } finally {
            setCommentsLoading(prev => new Map(prev).set(ticketId, false));
        }
    }, []);

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        try {
            setNotificationsLoading(true);
            const res = await api.get("/notifications");
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setNotificationsLoading(false);
        }
    }, []);

    // Mark single notification as read
    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            await api.put(`/notifications/${notificationId}`);
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    }, []);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        try {
            await api.put("/notifications/all");
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all notifications as read", err);
        }
    }, []);

    // Delete single notification
    const deleteNotification = useCallback(async (notificationId: string) => {
        try {
            const notification = notifications.find(n => n._id === notificationId);
            await api.delete(`/notifications/${notificationId}`);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            if (notification && !notification.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error("Failed to delete notification", err);
        }
    }, [notifications]);

    // Delete all notifications
    const deleteAllNotifications = useCallback(async () => {
        try {
            await api.delete("/notifications/all");
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to delete all notifications", err);
        }
    }, []);

    useEffect(() => {
        if (!user) {
            disconnectSocket();
            setSocket(null);
            setIsConnected(false);
            setOnlineUsers([]);
            setTickets([]);
            setComments(new Map());
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        // Fetch initial data
        refreshTickets();
        fetchNotifications();

        const initSocket = async () => {
            try {
                const s = await getSocket();
                setSocket(s);

                s.on("connect", () => {
                    console.log("Socket connected:", s.id);
                    setIsConnected(true);
                });

                s.on("disconnect", () => {
                    console.log("Socket disconnected");
                    setIsConnected(false);
                });

                s.on("connect_error", (err) => {
                    console.error("Socket connection error:", err.message);
                });

                // User presence
                s.on("user:online", ({ userId }: { userId: string }) => {
                    setOnlineUsers(prev => prev.includes(userId) ? prev : [...prev, userId]);
                });

                s.on("user:offline", ({ userId }: { userId: string }) => {
                    setOnlineUsers(prev => prev.filter(id => id !== userId));
                });

                // Ticket events
                s.on("ticket:created", (ticket: Ticket) => {
                    console.log("Received ticket:created", ticket);
                    setTickets(prev => [ticket, ...prev]);
                });

                s.on("ticket:updated", (updatedTicket: Ticket) => {
                    console.log("Received ticket:updated", updatedTicket);
                    setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
                });

                s.on("ticket:deleted", (data: { ticketId?: string; _id?: string }) => {
                    const ticketId = data.ticketId || data._id;
                    console.log("Received ticket:deleted", ticketId);
                    if (ticketId) {
                        setTickets(prev => prev.filter(t => t._id !== ticketId));
                    }
                });

                s.on("ticket:reviewed", (updatedTicket: Ticket) => {
                    console.log("Received ticket:reviewed", updatedTicket);
                    setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
                });

                // Comment events
                s.on("comment:added", ({ ticketId, comment }: { ticketId: string; comment: Comment }) => {
                    console.log("Received comment:added", ticketId, comment);
                    setComments(prev => {
                        const existing = prev.get(ticketId) || [];
                        // Avoid duplicates
                        if (existing.find(c => c._id === comment._id)) {
                            return prev;
                        }
                        return new Map(prev).set(ticketId, [...existing, comment]);
                    });
                });

                s.on("comment:deleted", ({ ticketId, commentId }: { ticketId: string; commentId: string }) => {
                    console.log("Received comment:deleted", ticketId, commentId);
                    setComments(prev => {
                        const existing = prev.get(ticketId) || [];
                        return new Map(prev).set(ticketId, existing.filter(c => c._id !== commentId));
                    });
                });

                // Comment reply events
                s.on("comment:replied", ({ ticketId, comment }: { ticketId: string; comment: Comment }) => {
                    console.log("Received comment:replied", ticketId, comment);
                    setComments(prev => {
                        const existing = prev.get(ticketId) || [];
                        if (existing.find(c => c._id === comment._id)) {
                            return prev;
                        }
                        return new Map(prev).set(ticketId, [...existing, comment]);
                    });
                });

                // Notification events
                s.on("notification:new", (notification: Notification) => {
                    console.log("Received notification:new", notification);
                    setNotifications(prev => [notification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                });

            } catch (err) {
                console.error("Failed to initialize socket", err);
            }
        };

        initSocket();

        return () => {
            disconnectSocket();
        };
    }, [user, refreshTickets, fetchNotifications]);

    return (
        <SocketContext.Provider value={{
            socket,
            isConnected,
            onlineUsers,
            tickets,
            ticketsLoading,
            refreshTickets,
            comments,
            commentsLoading,
            fetchComments,
            notifications,
            notificationsLoading,
            unreadCount,
            fetchNotifications,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            deleteAllNotifications,
        }}>
            {children}
        </SocketContext.Provider>
    );
}
