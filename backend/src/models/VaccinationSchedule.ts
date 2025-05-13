import mongoose, { Document, Schema } from "mongoose";

export interface IVaccinationSchedule extends Document {
  child: mongoose.Types.ObjectId;
  parent: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  venue: mongoose.Types.ObjectId;
  region: mongoose.Types.ObjectId;
  vaccine: mongoose.Types.ObjectId;
  date: Date;
  status: "scheduled" | "completed" | "missed" | "cancelled";
}

const scheduleSchema = new Schema<IVaccinationSchedule>(
  {
    child: { type: Schema.Types.ObjectId, ref: "Child", required: true },
    parent: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    venue: { type: Schema.Types.ObjectId, ref: "Venue", required: true },
    region: { type: Schema.Types.ObjectId, ref: "Region", required: true },
    vaccine: { type: Schema.Types.ObjectId, ref: "Vaccine", required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "missed", "cancelled"],
      required: true,
      default: "scheduled",
    },
  },
  { timestamps: true }
);

export const VaccinationSchedule = mongoose.model<IVaccinationSchedule>("VaccinationSchedule", scheduleSchema);