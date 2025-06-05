import mongoose, { Document, Schema } from "mongoose";

export interface IVaccine extends Document {
  name: string;
  description?: string;
  doses: number;
  minAgeInMonths: number; 
  maxAgeInMonths?: number;
}

const vaccineSchema = new Schema<IVaccine>(
  {
    name: { type: String, required: true, unique: true }, 
    description: { type: String },
    doses: { type: Number, required: true },
    minAgeInMonths: { type: Number, required: true }, 
    maxAgeInMonths: { type: Number, required: false }, 
  },
  { timestamps: true }
);

export const Vaccine = mongoose.model<IVaccine>("Vaccine", vaccineSchema);