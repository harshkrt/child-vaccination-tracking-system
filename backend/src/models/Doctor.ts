import mongoose, { Document, Schema } from "mongoose";

export interface IDoctor extends Document {
  userId: mongoose.Types.ObjectId;
  regionId: mongoose.Types.ObjectId;
  specialization: string;
}

const doctorSchema = new Schema<IDoctor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    regionId: { type: Schema.Types.ObjectId, ref: "Region", required: true },
    specialization: { type: String },
  },
  { timestamps: true }
);

export const Doctor = mongoose.model<IDoctor>("Doctor", doctorSchema);