import mongoose from "mongoose";
import { User } from "../models/User.model";
import "dotenv/config";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/your_db_name";

// 📌 Get email from CLI args
const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email");
  console.log("Usage: bun run make-admin user@email.com");
  process.exit(1);
}

async function makeUserAdmin(email: string) {
  try {
    await mongoose.connect(MONGO_URI);

    const user = await User.findOneAndUpdate(
      { email },
      { role: "admin" },
      { new: true }
    );

    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log(`✅ User ${user.email} is now an admin`);
  } catch (error) {
    console.error("❌ Error updating user:", error);
  } finally {
    await mongoose.disconnect();
  }
}

makeUserAdmin(email);
