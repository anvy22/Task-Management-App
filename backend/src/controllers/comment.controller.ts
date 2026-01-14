import type { Response } from "express";
import { Comment } from "../models/Comment.model";
import { Activity } from "../models/Activity.model";

export const addComment = async (req: any, res: Response) => {
  const comment = await Comment.create({
    ticketId: req.params.id,
    author: req.dbUser._id,
    content: req.body.content,
  });

  await Activity.create({
    ticketId: req.params.id,
    action: "COMMENT_ADDED",
    performedBy: req.dbUser._id,
  });

  res.status(201).json(comment);
};

export const getComments = async (req: any, res: Response) => {
  const comments = await Comment.find({ ticketId: req.params.id })
    .populate("author", "name")
    .sort({ createdAt: 1 });

  res.json(comments);
};
