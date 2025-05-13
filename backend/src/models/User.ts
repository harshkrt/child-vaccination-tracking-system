import mongoose, { Document, Schema, model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["parent", "doctor", "admin"],
      default: "parent",
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
