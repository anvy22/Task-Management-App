import { Ticket } from "../models/Ticket.model";
import { Activity } from "../models/Activity.model";
import { User } from "../models/User.model";
import { emitToUser } from "../services/socketEvents";
import { createNotification } from "./notification.service";

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

  await ticket.populate("assignedTo", "firebaseUid name");

  if (ticket.assignedTo && ticket.assignedTo._id.toString() !== adminId.toString()) {
    const assignee = ticket.assignedTo as any;
    emitToUser(assignee.firebaseUid, "ticket:created", ticket);

    // Create notification for assignee
    await createNotification({
      recipientId: assignee._id.toString(),
      recipientFirebaseUid: assignee.firebaseUid,
      type: "ticket:assigned",
      title: "New Ticket Assigned",
      message: `You have been assigned a new ticket: ${ticket.title}`,
      refType: "ticket",
      refId: ticket._id,
      actorId: adminId,
    });
  }

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


  if (status === "done") {
    ticket.isReviewed = userRole === "admin";
  } else {

    ticket.isReviewed = false;
  }

  await ticket.save();
  await ticket.populate("assignedTo", "firebaseUid name");
  await ticket.populate("createdBy", "firebaseUid name");

  const assignee = ticket.assignedTo as any;
  const creator = ticket.createdBy as any;


  if (assignee) {
    emitToUser(assignee.firebaseUid, "ticket:updated", ticket);
  }


  if (creator && userId !== creator._id.toString()) {
    await createNotification({
      recipientId: creator._id.toString(),
      recipientFirebaseUid: creator.firebaseUid,
      type: "ticket:updated",
      title: "Ticket Status Updated",
      message: `Ticket "${ticket.title}" status changed from ${oldStatus} to ${status}`,
      refType: "ticket",
      refId: ticket._id,
      actorId: userId,
    });
  }

  await Activity.create({
    ticketId: ticket._id,
    action: "STATUS_UPDATED",
    oldValue: oldStatus,
    newValue: status,
    performedBy: userId,
  });

  return ticket;
};


export const reviewTicketService = async (ticket: any, userId: string) => {
  ticket.isReviewed = true;
  await ticket.save();

  await ticket.populate("assignedTo", "firebaseUid name");

  const assignee = ticket.assignedTo as any;

  if (assignee) {
    emitToUser(assignee.firebaseUid, "ticket:reviewed", ticket);


    await createNotification({
      recipientId: assignee._id.toString(),
      recipientFirebaseUid: assignee.firebaseUid,
      type: "ticket:reviewed",
      title: "Ticket Reviewed",
      message: `Your ticket "${ticket.title}" has been reviewed`,
      refType: "ticket",
      refId: ticket._id,
      actorId: userId,
    });
  }

  await Activity.create({
    ticketId: ticket._id,
    action: "TICKET_REVIEWED",
    performedBy: userId,
  });

  return ticket;
};
