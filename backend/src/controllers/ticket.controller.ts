import type { Request, Response } from "express";
import { Ticket } from "../models/Ticket.model";
import { Activity } from "../models/Activity.model";
import { Comment } from "../models/Comment.model";
import {
  createTicketService,
  updateTicketStatusService,
  reviewTicketService,
} from "../services/ticket.service";
import { emitToUser } from "../services/socketEvents";
import { createNotification } from "../services/notification.service";

export const createTicket = async (req: any, res: Response) => {
  const ticket = await createTicketService(req.body, req.dbUser._id);
  res.status(201).json(ticket);
};


export const getTickets = async (req: any, res: Response) => {
  const filter =
    req.dbUser.role === "admin"
      ? {}
      : { assignedTo: req.dbUser._id };

  const tickets = await Ticket.find(filter)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name");

  res.json(tickets);
};


export const getTicketById = async (req: any, res: Response) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");

  if (!ticket) return res.status(404).json({ message: "Ticket not found" });


  if (
    req.dbUser.role !== "admin" &&
    ticket.assignedTo._id.toString() !== req.dbUser._id.toString()
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.json(ticket);
};


export const updateTicketStatus = async (req: any, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });


  if (
    req.dbUser.role !== "admin" &&
    ticket.assignedTo.toString() !== req.dbUser._id.toString()
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const updated = await updateTicketStatusService(
    ticket,
    req.body.status,
    req.dbUser._id,
    req.dbUser.role
  );

  res.json(updated);
};


// Admin reviews a completed ticket
export const reviewTicket = async (req: any, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  if (ticket.status !== "done") {
    return res.status(400).json({ message: "Can only review completed tickets" });
  }

  const updated = await reviewTicketService(ticket, req.dbUser._id);
  res.json(updated);
};


export const deleteTicket = async (req: any, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  const ticketTitle = ticket.title;
  const ticketId = ticket._id.toString();

  await Activity.deleteMany({ ticketId: req.params.id });
  await Comment.deleteMany({ ticketId: req.params.id });

  await Ticket.findByIdAndDelete(req.params.id);

  await ticket.populate("assignedTo", "firebaseUid");

  if (ticket.assignedTo) {
    const assignee = ticket.assignedTo as any;
    emitToUser(assignee.firebaseUid, "ticket:deleted", { ticketId });

    // Notify assignee that their ticket was deleted
    await createNotification({
      recipientId: assignee._id.toString(),
      recipientFirebaseUid: assignee.firebaseUid,
      type: "ticket:deleted",
      title: "Ticket Deleted",
      message: `Ticket "${ticketTitle}" has been deleted`,
      refType: "ticket",
      actorId: req.dbUser._id,
    });
  }

  res.json({ message: "Ticket deleted successfully" });
};
