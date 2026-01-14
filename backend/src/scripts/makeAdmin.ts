import mongoose from "mongoose";
import { User } from "../models/User.model";
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/your_db_name";

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

        console.log(`User ${user.email} is now an admin`);
    } catch (error) {
        console.error("❌ Error updating user:", error);
    } finally {
        await mongoose.disconnect();
    }
}

async function showUsers() {
    try {
        await mongoose.connect(MONGO_URI);

        const users = await User.find();
        console.log(users);


    } catch (error) {
        console.error("❌ Error reading db:", error);
    }
}



makeUserAdmin("test@mail.com");

// showUsers()
