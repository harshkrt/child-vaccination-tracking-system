import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { VaccinationSchedule } from "../models/VaccinationSchedule";

//get all the vaccination schedules of a doctor
export const getVaccinationSchedules = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const doctorId = req.user?._id;

    const schedules = await VaccinationSchedule.find({ doctor: doctorId });
    console.log(schedules);
    if (!schedules || schedules.length === 0) {
        res.status(404).json({ msg: "No vaccination schedules found." });
        return;
    }
    res.status(200).json(schedules);
});

//complete a vaccination schedule
export const completeVaccination = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const doctorId = req.user?._id;
    const { id } =req.params;
    const schedule = await VaccinationSchedule.findOne({ _id: id, doctor: doctorId});

    if (!schedule) {
        res.status(404).json({ msg: "vaccination schedule not found or not authorized."});
        return;
    }

    if (schedule.status != "scheduled") {
        res.status(400).json({ msg: "vaccination schedule already completed or cancelled."});
        return;
    }

    schedule.status = "completed";
    await schedule.save();

    res.status(200).json({ msg: "Vaccination completed successfully."});
});