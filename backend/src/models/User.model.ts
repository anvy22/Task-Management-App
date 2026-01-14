import {model,Schema} from "mongoose"

const userSchema = new Schema({
    firebaseUid: { type: String , unique: true},
    name: String,
    email: { type:String , unique: true},
    role:{
        type: String,
        enum: ["admin","user"],
        default: "user",
    },
    isActive: { type: Boolean , default: true},
},
{ timestamps: true},
);

export const User = model("User", userSchema);