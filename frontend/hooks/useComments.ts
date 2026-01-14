"use client";

import useSWR, { SWRConfiguration } from "swr";

export type Comment = {
    _id: string;
    content: string;
    author: {
        _id: string;
        name: string;
    };
    createdAt: string;
};

export function useComments(ticketId: string, config?: SWRConfiguration) {
    const { data, error, isLoading, mutate } = useSWR<Comment[]>(
        ticketId ? `/tickets/${ticketId}/comments` : null,
        config
    );

    return {
        comments: data || [],
        isLoading,
        isError: error,
        mutate,
    };
}
