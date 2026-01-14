import type { Request, Response } from "express";
import { User } from "../models/User.model";
import { Ticket } from "../models/Ticket.model";

interface AuthUser {
       _id: string;
       email: string;
       role: string;
       uid: string;
}

interface UserRequest extends Request {
       user?: AuthUser;
}

export const getUsers = async (_req: Request, res: Response) => {
       try {
              const users = await User.find().select(" _id name email role");
              res.json(users);
       } catch (error) {
              res.status(500).json("Failed to fetch users");
       }
}

export const setName = async (req: UserRequest, res: Response) => {
       try {
              const { name } = req.body;
              const email = req.user?.email;

              if (!email) {
                     return res.status(401).json({ message: "Unauthorized" });
              }

              if (!name) {
                     return res.status(400).json({ message: "Name is required" });
              }

              const user = await User.findOneAndUpdate(
                     { email },
                     { name },
                     { new: true, runValidators: true }
              );

              if (!user) {
                     return res.status(404).json({ message: "User not found" });
              }

              return res.status(200).json({
                     message: "Name updated successfully",
              });
       } catch (error) {
              console.error(error);
              return res.status(500).json({ message: "Failed to update name" });
       }
};



export const getDetails = async (req: UserRequest, res: Response) => {
       try {
              const email = req.user?.email;

              if (!email) {
                     return res.status(401).json({
                            message: "Unauthorised"
                     });
              }

              const user = await User.findOne({
                     email
              }).select("_id name email role isActive createdAt");

              if (!user) {
                     return res.status(404).json({
                            message: "User not found"
                     })
              }

              return res.status(200).json(user);
       } catch (error) {
              console.error("getDetails error:", error);
              return res.status(500).json({ message: "Failed to get user details" });
       }
}



export const getAssignedTicketsDetails = async (
       req: UserRequest,
       res: Response
) => {
       try {
              const { userId } = req.query;
              

              let targetUserId = userId;

              if (!targetUserId) {
                     console.log("No userId provided");
                     return res.status(400).json({ message: "User ID is required" });
              }

              const user = await User.findById(targetUserId);

              if (!user) {
                     console.log(`User not found for ID: ${targetUserId}`);
                     return res.status(404).json({
                            message: "User not found",
                     });
              }


              const tickets = await Ticket.find({
                     assignedTo: user._id,
              })
                     .select("_id title status priority deadline createdAt updatedAt")
                     .sort({ createdAt: -1 });

              
              if (tickets.length === 0) {
                     return res.status(200).json([]);
              }


              return res.status(200).json(tickets);
       } catch (error) {
              console.error("getAssignedTicketsDetails error:", error);
              return res.status(500).json({
                     message: "Failed to get user ticket details",
              });
       }
};
