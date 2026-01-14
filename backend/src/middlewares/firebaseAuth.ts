import type { Request, Response, NextFunction } from "express";
import admin from "../config/firebase";

export interface AuthRequest extends Request {
  user?: any;
}

export const firebaseAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  console.log(`[FirebaseAuth] Request to ${req.path}, Method: ${req.method}`);
  console.log(`[FirebaseAuth] Auth Header: ${authHeader ? "Present" : "Missing"}`);

  const token = authHeader?.split(" ")[1];

  if (!token) {
    console.warn("[FirebaseAuth] No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    console.log(`[FirebaseAuth] Token verified for UID: ${decoded.uid}`);
    req.user = decoded;
    next();
  } catch (error) {
    console.error(`[FirebaseAuth] Token verification failed:`, error);
    return res.status(401).json({ message: "Invalid token" });
  }
};
