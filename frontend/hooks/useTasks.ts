"use client";

import useSWR, { SWRConfiguration } from "swr";
export type Task = {
    _id: string;
    title: string;
    description?: string;
    status: "pending" | "completed";
    priority: "low" | "medium" | "high";
    dueDate?: string;
    assignedTo: {
        _id: string;
        name: string;
        email: string;
    } | string;
    createdBy: {
        _id: string;
        name: string;
        email: string;
    } | string;
    createdAt: string;
    updatedAt: string;
};

export function useTasks(config?: SWRConfiguration) {
    const { data, error, isLoading, mutate } = useSWR<Task[]>("/tasks", {
        ...config,
    });

    return {
        tasks: data || [],
        isLoading,
        isError: error,
        mutate,
    };
}
