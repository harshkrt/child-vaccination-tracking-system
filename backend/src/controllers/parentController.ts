import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Child } from '../models/Child';
import {Region} from "../models/Region";
import {Vaccine} from "../models/Vaccine";
import { VaccinationSchedule } from '../models/VaccinationSchedule';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

//adding a child
export const addChild = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { name, dob, gender } = req.body;

    if (!name || !dob || !gender) {
        res.status(400).json({ msg: "Please provide details."});
        return;
    }

    const child = await Child.create({
        name,
        dob,
        gender,
        parentId: req.user?._id,
    });

    res.status(201).json(child);
});

//get all the added children
export const getChildren = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const children = await Child.find({ parentId: req.user?._id });
    res.status(200).json(children);
});

export const scheduleVaccination = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const parentId = req.user?._id;
    const { child, vaccine, region, date } = req.body;

    if (!child || !parentId || !vaccine || !region || !date) {
        res.status(400).json({ msg: "Please provide all required details." });
        return;
    }

    // Check if child belongs to parent
    const childDoc = await Child.findOne({ _id: child, parentId });
    if (!childDoc) {
        res.status(404).json({ msg: "Child not found or doesn't belong to the parent" });
        return;
    }

    // Check if region exists
    const regionDoc = await Region.findById(region);
    if (!regionDoc) {
        res.status(404).json({ msg: "Region not found" });
        return;
    }

    // Check if vaccine exists
    const vaccineDoc = await Vaccine.findById(vaccine);
    if (!vaccineDoc) {
        res.status(404).json({ msg: "Vaccine not found" });
        return;
    }

    // Create the vaccination schedule
    const schedule = await VaccinationSchedule.create({
        child,
        parent: parentId,
        vaccine,
        region,
        doctor: regionDoc.doctor,
        venue: regionDoc.venue,
        date,
        status: "scheduled",
    });

    res.status(201).json(schedule);
});

//get all the scheduled vaccinations of a parent
export const getVaccinationSchedule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const parentId = req.user?._id;

    const schedules = await VaccinationSchedule.find({ parent: parentId });
    res.status(200).json(schedules);
});

// cancel a scheduled vaccination
export const cancelVaccination = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const parentId = req.user?._id;
    const scheduleId = req.params.id;
    console.log(parentId, scheduleId);
    const schedule = await VaccinationSchedule.findOne({ _id: scheduleId, parent: parentId });

    if (!schedule) {
        res.status(404).json({msg: "vaccination schedule not found or not authorized."});
        return;
    }

    if (schedule.status != "scheduled") {
        res.status(400).json({msg: "Only scheduled Vaccinations can be cancelled."});
        return;
    }

    schedule.status = "cancelled";
    await schedule.save();

    res.status(200).json({ msg: "Vaccination schedule cancelled successfully."});
});