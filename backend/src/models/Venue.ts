import mongoose, { Document, Schema } from "mongoose";

export interface IVenue extends Document {
  name: string;
  contact: string;
}

const venueSchema = new Schema<IVenue>(
  {
    name: { type: String, required: true },
    contact: { type: String, required: true },
  },
  { timestamps: true }
);

export const Venue = mongoose.model<IVenue>("Venue", venueSchema);