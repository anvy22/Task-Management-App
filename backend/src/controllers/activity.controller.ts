import type { Response } from "express";
import { Activity } from "../models/Activity.model";

export const getActivity = async (req: any, res: Response) => {
  const activity = await Activity.find({ ticketId: req.params.id })
    .populate("performedBy", "name")
    .sort({ timestamp: -1 });

  res.json(activity);
};
