import { Ticket } from "../models/Ticket.model";
import { Activity } from "../models/Activity.model";

export const createTicketService = async (data: any, adminId: string) => {
  const ticket = await Ticket.create({
    ...data,
    createdBy: adminId,
  });

  await Activity.create({
    ticketId: ticket._id,
    action: "TICKET_CREATED",
    performedBy: adminId,
  });

  return ticket;
};

export const updateTicketStatusService = async (
  ticket: any,
  status: string,
  userId: string,
  userRole: string
) => {
  const oldStatus = ticket.status;
  ticket.status = status;

  // If moving to "done": admin = reviewed, user = pending review
  if (status === "done") {
    ticket.isReviewed = userRole === "admin";
  } else {
    // If moving away from done, reset isReviewed
    ticket.isReviewed = false;
  }

  await ticket.save();

  await Activity.create({
    ticketId: ticket._id,
    action: "STATUS_UPDATED",
    oldValue: oldStatus,
    newValue: status,
    performedBy: userId,
  });

  return ticket;
};

// Admin reviews a completed ticket
export const reviewTicketService = async (ticket: any, userId: string) => {
  ticket.isReviewed = true;
  await ticket.save();

  await Activity.create({
    ticketId: ticket._id,
    action: "TICKET_REVIEWED",
    performedBy: userId,
  });

  return ticket;
};

