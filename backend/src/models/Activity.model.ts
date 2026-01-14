import { Schema, model, Types } from "mongoose";

const activitySchema = new Schema({
  ticketId: {
    type: Types.ObjectId,
    ref: "Ticket",
    required: true,
  },
  action: String,
  oldValue: String,
  newValue: String,
  performedBy: {
    type: Types.ObjectId,
    ref: "User",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const Activity = model("Activity", activitySchema);
