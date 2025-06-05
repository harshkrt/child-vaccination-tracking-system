import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { VaccinationSchedule } from "../models/VaccinationSchedule";
import type { IChild } from "../models/Child";
import type { IUser } from "../models/User";
import type { IVaccine } from "../models/Vaccine";
import type { IVenue } from "../models/Venue";
import type { IRegion } from "../models/Region";

export const getVaccinationSchedules = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const doctorId = req.user?._id;

    const schedules = await VaccinationSchedule.find({ doctor: doctorId })
        .populate<{ child: Pick<IChild, '_id' | 'name' | 'dob' | 'gender'> }>('child', 'name dob gender')
        .populate<{ parent: Pick<IUser, '_id' | 'name' | 'email'> }>('parent', 'name email')
        .populate<{ vaccine: Pick<IVaccine, '_id' | 'name' | 'description' | 'doses'> }>('vaccine', 'name description doses')
        .populate<{ venue: Pick<IVenue, '_id' | 'name' | 'contact'> }>('venue', 'name contact')
        .populate<{ region: Pick<IRegion, '_id' | 'name'> }>('region', 'name')
        .sort({ date: 'asc' }); // Sort by date, perhaps ascending

    // console.log("Populated schedules for doctor:", schedules); // For debugging
    if (!schedules || schedules.length === 0) {
        // Send 200 with empty array for consistency if "not found" isn't strictly an error for an empty list
        res.status(200).json([]); 
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

// Get doctor dashboard statistics
export const getDoctorDashboardStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const doctorId = req.user?._id;

    if (!doctorId) {
        res.status(401).json({ msg: "Not authorized, no doctor ID found." });
        return;
    }

    try {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday as start of week
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);


        const todaysAppointmentsCount = await VaccinationSchedule.countDocuments({
            doctor: doctorId,
            date: { $gte: startOfToday, $lt: endOfToday },
            status: "scheduled" // Only count those still scheduled for today
        });

        const completedThisWeekCount = await VaccinationSchedule.countDocuments({
            doctor: doctorId,
            status: "completed",
            updatedAt: { $gte: startOfWeek, $lt: endOfWeek } // Assuming 'updatedAt' is when it's marked completed
        });
        
        // You could also count total scheduled appointments for this doctor
        // const totalScheduledForDoctor = await VaccinationSchedule.countDocuments({
        //     doctor: doctorId,
        //     status: "scheduled"
        // });

        res.status(200).json({
            todaysAppointments: todaysAppointmentsCount,
            completedThisWeek: completedThisWeekCount,
            // totalScheduled: totalScheduledForDoctor 
        });

    } catch (error) {
        console.error("Error fetching doctor dashboard stats:", error);
        res.status(500).json({ msg: "Server error while fetching dashboard statistics." });
    }
});