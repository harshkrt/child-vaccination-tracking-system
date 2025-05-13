import mongoose, { Document, Types } from "mongoose";
import { IVenue } from "./Venue";
import { IDoctor } from "./Doctor";
export interface IRegion extends Document {
    villageName: string;
    doctor: Types.ObjectId;
    venue: Types.ObjectId;
}

const regionSchema = new mongoose.Schema<IRegion>(
    {
        villageName: { type: String, required: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
        venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
    },
    { timestamps: true }
);

export const Region = mongoose.model<IRegion>("Region", regionSchema);