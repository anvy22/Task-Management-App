import { Schema, model, Types } from "mongoose"

const commentSchema = new Schema({
    ticketId: {
        type: Types.ObjectId,
        ref: "Ticket",
        required: true,
    },
    author: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
},
    { timestamps: true },

);

export const Comment = model("Comment", commentSchema);