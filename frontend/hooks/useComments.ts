"use client";

import { useSocket, Comment } from "@/components/providers/SocketProvider";
import { useEffect } from "react";

export type { Comment };

export function useComments(ticketId: string) {
    const { comments, commentsLoading, fetchComments } = useSocket();

    useEffect(() => {
        if (ticketId) {
            fetchComments(ticketId);
        }
    }, [ticketId, fetchComments]);

    return {
        comments: comments.get(ticketId) || [],
        isLoading: commentsLoading.get(ticketId) || false,
        refresh: () => fetchComments(ticketId),
    };
}
