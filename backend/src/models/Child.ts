import mongoose, { Document, Types } from "mongoose";

export interface IChild extends Document {
  name: string;
  dob: Date;
  gender: string;
  parentId: mongoose.Types.ObjectId;
}

const childSchema = new mongoose.Schema<IChild>(
  {
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, //check once
  },
  { timestamps: true }
);

export const Child =  mongoose.model<IChild>("Child", childSchema);

