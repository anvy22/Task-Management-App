"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

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

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchTasks = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get("/tasks");
            setTasks(res.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch tasks", err);
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return {
        tasks,
        isLoading,
        isError: error,
        refresh: fetchTasks,
        setTasks,
    };
}
