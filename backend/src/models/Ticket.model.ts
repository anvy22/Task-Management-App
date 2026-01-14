import { Schema, model, Types } from "mongoose";

const ticketSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,

    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    deadline: { type: Date },

    
    isReviewed: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Ticket = model("Ticket", ticketSchema);

