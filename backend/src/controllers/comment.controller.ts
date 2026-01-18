import type { Response } from "express";
import { Comment } from "../models/Comment.model";
import { Ticket } from "../models/Ticket.model";
import { Activity } from "../models/Activity.model";
import { emitToUser } from "../services/socketEvents";
import { createNotification } from "../services/notification.service";

export const addComment = async (req: any, res: Response) => {
  const comment = await Comment.create({
    ticketId: req.params.id,
    author: req.dbUser._id,
    content: req.body.content,
    replyTo: req.body.replyTo || null,
  });

  await comment.populate("author", "name");


  const ticket = await Ticket.findById(req.params.id)
    .populate("assignedTo", "firebaseUid name")
    .populate("createdBy", "firebaseUid name");

  if (ticket) {
    const authorId = req.dbUser._id.toString();
    const authorName = req.dbUser.name || "Someone";
    const creator = ticket.createdBy as any;
    const assignee = ticket.assignedTo as any;
    const creatorId = creator._id.toString();
    const assigneeId = assignee._id.toString();


    if (creatorId !== authorId) {
      emitToUser(creator.firebaseUid, "comment:added", { ticketId: req.params.id, comment });

      await createNotification({
        recipientId: creatorId,
        recipientFirebaseUid: creator.firebaseUid,
        type: "comment:added",
        title: "New Comment",
        message: `${authorName} commented on ticket "${ticket.title}"`,
        refType: "comment",
        refId: comment._id,
        actorId: req.dbUser._id,
        metadata: { ticketId: req.params.id },
      });
    }


    if (assigneeId !== authorId && assigneeId !== creatorId) {
      emitToUser(assignee.firebaseUid, "comment:added", { ticketId: req.params.id, comment });

      await createNotification({
        recipientId: assigneeId,
        recipientFirebaseUid: assignee.firebaseUid,
        type: "comment:added",
        title: "New Comment",
        message: `${authorName} commented on ticket "${ticket.title}"`,
        refType: "comment",
        refId: comment._id,
        actorId: req.dbUser._id,
        metadata: { ticketId: req.params.id },
      });
    }

    // Notify original comment author if this is a reply
    if (req.body.replyTo) {
      const originalComment = await Comment.findById(req.body.replyTo).populate("author", "firebaseUid name");
      if (originalComment && originalComment.author) {
        const originalAuthor = originalComment.author as any;
        const originalAuthorId = originalAuthor._id.toString();

        // Only notify if replying to someone else's comment (not self-reply)
        // and not already notified as creator or assignee
        if (originalAuthorId !== authorId && originalAuthorId !== creatorId && originalAuthorId !== assigneeId) {
          emitToUser(originalAuthor.firebaseUid, "comment:replied", { ticketId: req.params.id, comment, originalComment });

          await createNotification({
            recipientId: originalAuthorId,
            recipientFirebaseUid: originalAuthor.firebaseUid,
            type: "comment:replied",
            title: "Reply to Your Comment",
            message: `${authorName} replied to your comment on ticket "${ticket.title}"`,
            refType: "comment",
            refId: comment._id,
            actorId: req.dbUser._id,
            metadata: { ticketId: req.params.id, originalCommentId: req.body.replyTo },
          });
        }
      }
    }
  }

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
    .populate({
      path: "replyTo",
      select: "content author",
      populate: {
        path: "author",
        select: "name"
      }
    })
    .sort({ createdAt: 1 });

  res.json(comments);
};

export const deleteComment = async (req: any, res: Response) => {
  const { ticketId, commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }


  if (comment.author.toString() !== req.dbUser._id.toString() && req.dbUser.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  await comment.deleteOne();


  const ticket = await Ticket.findById(ticketId)
    .populate("assignedTo", "firebaseUid")
    .populate("createdBy", "firebaseUid");

  if (ticket) {
    const performerId = req.dbUser._id.toString();
    const creatorId = ticket.createdBy._id.toString();
    const assigneeId = ticket.assignedTo._id.toString();


    if (creatorId !== performerId) {
      emitToUser((ticket.createdBy as any).firebaseUid, "comment:deleted", { ticketId, commentId });
    }


    if (assigneeId !== performerId && assigneeId !== creatorId) {
      emitToUser((ticket.assignedTo as any).firebaseUid, "comment:deleted", { ticketId, commentId });
    }
  }

  await Activity.create({
    ticketId,
    action: "COMMENT_DELETED",
    performedBy: req.dbUser._id,
  });

  res.json({ message: "Comment deleted" });
};
