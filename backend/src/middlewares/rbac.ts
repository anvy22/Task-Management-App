import type { Response, NextFunction } from "express";
import { User } from "../models/User.model";

export const authorize =
  (roles: ("admin" | "user")[]) =>
  async (req: any, res: Response, next: NextFunction) => {
    const dbUser = await User.findOne({ firebaseUid: req.user.uid });

    if (!dbUser || !roles.includes(dbUser.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.dbUser = dbUser;
    next();
  };
