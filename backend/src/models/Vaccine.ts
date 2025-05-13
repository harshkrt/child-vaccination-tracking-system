import mongoose, { Document, Schema } from "mongoose";

export interface IVaccine extends Document {
  name: string;
  description?: string;
  doses: number;
}

const vaccineSchema = new Schema<IVaccine>(
  {
    name: { type: String, required: true },
    description: { type: String },
    doses: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Vaccine = mongoose.model<IVaccine>("Vaccine", vaccineSchema);