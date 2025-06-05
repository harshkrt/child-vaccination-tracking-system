import mongoose, { Document, Schema } from "mongoose";

export interface IVaccinationSchedule extends Document {
  child: mongoose.Types.ObjectId;
  parent: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  venue: mongoose.Types.ObjectId;
  region: mongoose.Types.ObjectId;
  vaccine: mongoose.Types.ObjectId;
  date: Date;
  status: "pending_approval" | "scheduled" | "completed" | "missed" | "cancelled" | "rejected_by_admin";
}

const scheduleSchema = new Schema<IVaccinationSchedule>(
  {
    child: { type: Schema.Types.ObjectId, ref: "Child", required: true },
    parent: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    venue: { type: Schema.Types.ObjectId, ref: "Venue", required: true },
    region: { type: Schema.Types.ObjectId, ref: "Region", required: true },
    vaccine: { type: Schema.Types.ObjectId, ref: "Vaccine", required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending_approval", "scheduled", "completed", "missed", "cancelled", "rejected_by_admin"],
      required: true,
      default: "pending_approval",
    },
  },
  { timestamps: true }
);

export const VaccinationSchedule = mongoose.model<IVaccinationSchedule>("VaccinationSchedule", scheduleSchema);