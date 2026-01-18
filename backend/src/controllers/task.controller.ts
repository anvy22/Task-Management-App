import type { Request, Response } from "express";
import { Task } from "../models/Task.model";




interface AuthRequest extends Request {
    user?: any;
    dbUser?: any;
}

export const createTask = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, priority, dueDate } = req.body;
        const user = req.dbUser;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }


        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo: user._id,
            createdBy: user._id,
            status: "pending",
        });


        await task.populate(["assignedTo", "createdBy"]);

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.dbUser;


        const tasks = await Task.find({ createdBy: user._id })
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const user = req.dbUser;

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }


        if (task.createdBy.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const updatedTask = await Task.findByIdAndUpdate(id, updates, {
            new: true,
        })
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.dbUser;

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }


        if (task.createdBy.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await task.deleteOne();
        res.json({ message: "Task deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
