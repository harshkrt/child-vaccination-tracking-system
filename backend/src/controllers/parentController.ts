import { Response } from "express";
import asyncHandler from "express-async-handler";
import { Child, IChild } from "../models/Child";
import { Region } from "../models/Region";
import type { IRegion } from "../models/Region";
import { Vaccine, IVaccine } from "../models/Vaccine";
import { VaccinationSchedule } from "../models/VaccinationSchedule";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { User } from "../models/User"; // Import User to verify doctor
import type { IUser } from "../models/User"; // Import IUser type/interface as a type
import type { IVenue } from "../models/Venue"; // Import IVenue type/interface as a type

//adding a child
export const addChild = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { name, dob, gender } = req.body;

    if (!name || !dob || !gender) {
      res.status(400).json({ msg: "Please provide all details." });
      return;
    }
    // Validate DOB
    const dateOfBirth = new Date(dob);
    if (isNaN(dateOfBirth.getTime())) {
      res.status(400).json({ msg: "Invalid date of birth." });
      return;
    }
    if (dateOfBirth > new Date()) {
      res.status(400).json({ msg: "Date of birth cannot be in the future." });
      return;
    }

    const child = await Child.create({
      name,
      dob: dateOfBirth,
      gender,
      parentId: req.user?._id,
    });

    res.status(201).json(child);
  }
);

//get all the added children
export const getChildren = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const children = await Child.find({ parentId: req.user?._id });
    res.status(200).json(children);
  }
);

//controller for scheduling a vaccination
export const scheduleVaccination = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const parentId = req.user?._id;
    const { child, vaccine, region, date } = req.body;

    if (!child || !vaccine || !region || !date) {
      res
        .status(400)
        .json({
          msg: "Please provide all required details (child, vaccine, region, date).",
        });
      return;
    }

    // Validate date
    const scheduleDate = new Date(date);
    if (isNaN(scheduleDate.getTime())) {
      res.status(400).json({ msg: "Invalid schedule date." });
      return;
    }
    if (scheduleDate < new Date()) {
      // Ensure not scheduling in the past. Allow same day.
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (scheduleDate < today) {
        res.status(400).json({ msg: "Schedule date cannot be in the past." });
        return;
      }
    }

    // Check if child belongs to parent
    const childDoc = await Child.findOne({ _id: child, parentId });
    if (!childDoc) {
      res
        .status(404)
        .json({ msg: "Child not found or doesn't belong to the parent" });
      return;
    }

    // Check if region exists and get its doctor
    const regionDoc = await Region.findById(region);
    if (!regionDoc) {
      res.status(404).json({ msg: "Region not found" });
      return;
    }

    // Verify region's doctor is a valid user with role 'doctor'
    const doctorUser = await User.findOne({
      _id: regionDoc.doctor,
      role: "doctor",
    });
    if (!doctorUser) {
      res
        .status(404)
        .json({
          msg: "Doctor assigned to the region not found or is not a valid doctor.",
        });
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
      date: scheduleDate,
      status: "pending_approval",
    });

    res.status(201).json(schedule);
  }
);

//get all the scheduled vaccinations of a parent
export const getVaccinationSchedule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const parentId = req.user?._id;

    const schedules = await VaccinationSchedule.find({ parent: parentId })
        .populate<{ child: Pick<IChild, '_id' | 'name' | 'dob'> }>('child', 'name dob')
        .populate<{ vaccine: Pick<IVaccine, '_id' | 'name'> }>('vaccine', 'name')
        .populate<{ venue: Pick<IVenue, '_id' | 'name'> }>('venue', 'name')
        .populate<{ doctor: Pick<IUser, '_id' | 'name' | 'email'> }>('doctor', 'name email') // *** ADDED THIS LINE ***
        .populate<{ region: Pick<IRegion, '_id' | 'name'> }>('region', 'name')
        .sort({ date: 1 });
    res.status(200).json(schedules);
});

// cancel a scheduled vaccination
export const cancelVaccination = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const parentId = req.user?._id;
    const scheduleId = req.params.id;

    const schedule = await VaccinationSchedule.findOne({
      _id: scheduleId,
      parent: parentId,
    });

    if (!schedule) {
      res
        .status(404)
        .json({ msg: "Vaccination schedule not found or not authorized." });
      return;
    }

    // Parent can cancel 'scheduled' or 'pending_approval' vaccinations.
    if (!["scheduled", "pending_approval"].includes(schedule.status)) {
      res
        .status(400)
        .json({
          msg: `Only vaccinations with status 'scheduled' or 'pending_approval' can be cancelled. Current status: ${schedule.status}`,
        });
      return;
    }

    schedule.status = "cancelled";
    await schedule.save();

    res
      .status(200)
      .json({ msg: "Vaccination schedule cancelled successfully." });
  }
);

export const getParentDashboardStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const parentId = req.user?._id;

    if (!parentId) {
      res.status(401).json({ msg: "Not authorized, no parent ID found." });
      return;
    }

    try {
      const childrenCount = await Child.countDocuments({ parentId: parentId });

      const upcomingVaccinationsCount =
        await VaccinationSchedule.countDocuments({
          parent: parentId,
          status: "scheduled",
          date: { $gte: new Date() },
        });
      const pendingApprovalCount = await VaccinationSchedule.countDocuments({
        parent: parentId,
        status: "pending_approval",
      });
      res.status(200).json({
        childrenCount: childrenCount,
        upcomingVaccinations: upcomingVaccinationsCount,
        pendingApproval: pendingApprovalCount,
      });
    } catch (error) {
      console.error("Error fetching parent dashboard stats:", error);
      res
        .status(500)
        .json({ msg: "Server error while fetching dashboard statistics." });
    }
  }
);
