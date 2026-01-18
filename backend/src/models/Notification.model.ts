import { Schema, model, Types } from "mongoose";

const notificationSchema = new Schema(
    {
        recipient: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        actor: {
            type: Types.ObjectId,
            ref: "User",
        },
        type: {
            type: String,
            enum: [
                "ticket:assigned",
                "ticket:updated",
                "ticket:reviewed",
                "ticket:deleted",
                "comment:added",
                "comment:replied",
            ],
            required: true,
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        refType: {
            type: String,
            enum: [
                "ticket",
                "comment",
            ],
        },
        refId: {
            type: Types.ObjectId,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        metadata: { type: Schema.Types.Mixed },
    },
    {
        timestamps: true,
    }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

export const Notification = model("Notification", notificationSchema);
