import type { Request, Response } from "express";
import { User } from "../models/User.model";

export const syncUser = async (req: any, res: Response) => {
  const { uid, email, displayName } = req.user;
  const name = displayName || email?.split("@")[0];

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        firebaseUid: uid,
        role: "user",
        name,
      });
    }


    return res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    });


  } catch (error) {
    console.error("Auth sync error:", error);
    return res.status(500).json({ message: "Auth sync failed" });
  }
};
