export type TicketStatus = "todo" | "in_progress" | "done";

export type Ticket = {
  _id: string;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: "low" | "medium" | "high";
  deadline?: string;
  isReviewed?: boolean;
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  };
  createdBy?: {
    _id: string;
    name: string;
    email?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

