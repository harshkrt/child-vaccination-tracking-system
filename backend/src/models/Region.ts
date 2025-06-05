import mongoose, { Document, Types } from "mongoose";
// Removed: import { IDoctor } from "./Doctor"; // No longer needed

export interface IRegion extends Document {
    name: string;
    doctor: Types.ObjectId; // Will now refer to User model
    venue: Types.ObjectId;
}

const regionSchema = new mongoose.Schema<IRegion>(
    {
        name: { type: String, required: true, unique: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
    },
    { timestamps: true }
);

export const Region = mongoose.model<IRegion>("Region", regionSchema);