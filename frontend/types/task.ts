export type Task = {
    _id: string;
    title: string;
    description?: string;
    status: "pending" | "completed";
    priority: "low" | "medium" | "high";
    dueDate?: string;
    assignedTo: string; // Simplified for personal tasks
    createdBy: string;
    createdAt: string;
    updatedAt: string;
};
