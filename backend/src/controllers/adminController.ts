import { Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { User, IUser } from "../models/User"; // Added IUser
import { Region, IRegion } from "../models/Region"; // Added IRegion
import { Vaccine, IVaccine } from "../models/Vaccine"; // Added IVaccine
import { VaccinationSchedule, IVaccinationSchedule } from "../models/VaccinationSchedule"; // Added IVaccinationSchedule
import { Venue, IVenue } from "../models/Venue";
import { Child, IChild } from "../models/Child";
import { PopulatedDoc } from 'mongoose';

// get all the users
export const getAllUsers = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  }
);

//delete a user from the database
export const deleteUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        res.status(404).json({ msg: "User not found." });
        return;
    }

    if (user.role === "admin") {
        res.status(400).json({ msg: "Cannot delete admin." });
        return;
    }

    await user.deleteOne();
    res.status(200).json({ msg: "User deleted successfully." });
});

//create a doctor
export const createDoctor = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ msg: "Please provide all required details." });
      return;
    }

    const existingDoc = await User.findOne({ email });
    if (existingDoc) { // Corrected check
      res.status(400).json({ msg: "Doctor with this email already exists." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoc = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "doctor",
    });

    res.status(201).json({
      id: newDoc._id,
      name: newDoc.name,
      email: newDoc.email,
      role: newDoc.role,
    });
  }
);

//add a region
export const addRegion = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { name, doctor, venue } = req.body; // doctor here is the ID of a User with role 'doctor'

    if (!name || !doctor || !venue) {
      res.status(400).json({ msg: "Please provide all required details." });
      return;
    }
    // Validate if doctor ID is a valid doctor
    const doctorUser = await User.findOne({ _id: doctor, role: "doctor" });
    if (!doctorUser) {
        res.status(400).json({ msg: "Invalid Doctor ID or user is not a doctor." });
        return;
    }
    // Validate if venue ID is a valid venue
    const venueDoc = await Venue.findById(venue);
    if (!venueDoc) {
        res.status(400).json({ msg: "Invalid Venue ID." });
        return;
    }

    const existingRegion = await Region.findOne({ name }); // Corrected check
    if (existingRegion) {
        res.status(400).json({ msg: "Region already exists." });
        return;
    }

    const region = await Region.create({
      name,
      doctor, // This is userId of role Doctor
      venue,
    });

    res.status(201).json(region);
  }
);

//adding venue
export const addVenue = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { name, contact } = req.body;

    if (!name || !contact) {
        res.status(400).json({msg: "Please provide all required details."});
        return;
    }

    const existingVenue = await Venue.findOne({ name }); // Corrected check
    if (existingVenue) {
        res.status(400).json({ msg: "Venue already exists." });
        return;
    }

    const venue = await Venue.create({
        name,
        contact,
    });

    res.status(201).json(venue);
});

//add vaccine
export const addVaccine = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { name, description, doses, minAgeInMonths, maxAgeInMonths } = req.body;

    if (!name || !description || !doses || minAgeInMonths === undefined) { // minAgeInMonths can be 0, so check for undefined
        res.status(400).json({ msg: "Please provide name, description, doses, and minAgeInMonths." });
        return;
    }
    if (isNaN(parseInt(doses)) || parseInt(doses) <= 0) {
        res.status(400).json({ msg: "Doses must be a positive number." });
        return;
    }
    if (isNaN(parseInt(minAgeInMonths)) || parseInt(minAgeInMonths) < 0) {
        res.status(400).json({ msg: "Minimum age in months must be a non-negative number." });
        return;
    }
    if (maxAgeInMonths !== undefined && (isNaN(parseInt(maxAgeInMonths)) || parseInt(maxAgeInMonths) < parseInt(minAgeInMonths))) {
        res.status(400).json({ msg: "Maximum age in months must be a non-negative number and not less than minimum age." });
        return;
    }


    const existingVaccine = await Vaccine.findOne({ name }); // Corrected check
    if (existingVaccine) {
        res.status(400).json({ msg: "Vaccine already exists." });
        return;
    }

    const vaccine = await Vaccine.create({
        name,
        description,
        doses: parseInt(doses),
        minAgeInMonths: parseInt(minAgeInMonths),
        maxAgeInMonths: maxAgeInMonths !== undefined ? parseInt(maxAgeInMonths) : undefined,
    });

    res.status(201).json(vaccine);
});

//delete completed, cancelled or missed Vaccination schedule
export const deleteVaccinationSchedule = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
        const { id } = req.params;
        const schedule = await VaccinationSchedule.findById(id);
        if (!schedule) {
            res.status(404).json({ msg: "Vaccination schedule not found." });
            return;
        }

        const deletableStatuses = ["completed", "cancelled", "missed", "rejected_by_admin"]; // Added rejected_by_admin

        if (!deletableStatuses.includes(schedule.status)) {
            res.status(400).json({ msg: `Vaccination schedule cannot be deleted. Status is ${schedule.status}` });
            return;
        }

        await schedule.deleteOne();
        res.status(200).json({ msg: "Vaccination schedule deleted successfully." });
  }
);

//delete a vaccine
export const deleteVaccine = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const vaccine = await Vaccine.findById(id);
    if (!vaccine) {
        res.status(404).json({ msg: "Vaccine not found." });
        return;
    }

    // Check if this vaccine is used in any non-completed/cancelled schedules
    const activeSchedules = await VaccinationSchedule.findOne({ 
        vaccine: id, 
        status: { $in: ["scheduled", "pending_approval"] }
    });

    if (activeSchedules) {
        res.status(400).json({ msg: "Vaccine cannot be deleted as it is part of active or pending vaccination schedules." });
        return;
    }

    await vaccine.deleteOne();
    res.status(200).json({ msg: "Vaccine deleted successfully." });
});


// ---- NEW CONTROLLERS FOR VACCINATION VERIFICATION ----

// Get all vaccination schedules pending approval
export const getPendingApprovalSchedules = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const schedules = await VaccinationSchedule.find({ status: "pending_approval" })
      .populate<{ child: IChild }>("child", "name dob gender")
      .populate<{ vaccine: IVaccine }>("vaccine", "name minAgeInMonths maxAgeInMonths doses")
      .populate<{ parent: IUser }>("parent", "name email")
      .populate<{ doctor: IUser }>("doctor", "name email") // Assuming doctor ref is to User model
      .populate<{ venue: IVenue }>("venue", "name contact")
      .populate<{ region: IRegion }>("region", "name")
      .sort({ date: 1 }); // Sort by schedule date

    if (!schedules || schedules.length === 0) {
      res.status(200).json([]);
      return;
    }

    const schedulesWithAgeInfo = schedules.map(doc => {
      const schedule = doc.toObject() as any as IVaccinationSchedule & { 
          child: IChild, 
          vaccine: IVaccine, 
          parent: IUser,
          doctor: IUser,
          venue: IVenue,
          region: IRegion
        };
      
      let childAgeInMonthsAtVaccination: number | null = null;
      if (schedule.child && schedule.child.dob && schedule.date) {
        const dob = new Date(schedule.child.dob);
        const vaccinationDate = new Date(schedule.date);
        
        let years = vaccinationDate.getFullYear() - dob.getFullYear();
        let months = vaccinationDate.getMonth() - dob.getMonth();
        let days = vaccinationDate.getDate() - dob.getDate();

        if (days < 0) {
            months--;
        }
        if (months < 0) {
            years--;
            months += 12;
        }
        childAgeInMonthsAtVaccination = years * 12 + months;
        if (childAgeInMonthsAtVaccination < 0) childAgeInMonthsAtVaccination = 0; // ensure non-negative
      }

      return {
        ...schedule,
        childAgeInMonthsAtVaccination,
        vaccineRecommendedMinAge: schedule.vaccine?.minAgeInMonths,
        vaccineRecommendedMaxAge: schedule.vaccine?.maxAgeInMonths,
      };
    });

    res.status(200).json(schedulesWithAgeInfo);
  }
);

// Review (approve/reject) a vaccination schedule
export const reviewVaccinationSchedule = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params; // Schedule ID
    const { decision } = req.body; // 'approve' or 'reject'

    if (!["approve", "reject"].includes(decision)) {
      res.status(400).json({ msg: "Invalid decision. Must be 'approve' or 'reject'." });
      return;
    }

    const schedule = await VaccinationSchedule.findById(id)
        .populate<{ child: IChild }>("child", "dob")
        .populate<{ vaccine: IVaccine }>("vaccine", "minAgeInMonths maxAgeInMonths");

    if (!schedule) {
      res.status(404).json({ msg: "Vaccination schedule not found." });
      return;
    }

    if (schedule.status !== "pending_approval") {
      res.status(400).json({ msg: `Schedule is not pending approval. Current status: ${schedule.status}` });
      return;
    }

    // Optional: Add server-side age check validation here if you want to enforce it,
    // even if the frontend should also guide the admin.
    // For now, we trust the admin's decision after they've been presented with info.

    if (decision === "approve") {
      schedule.status = "scheduled";
    } else { // decision === "reject"
      schedule.status = "rejected_by_admin";
      // Optionally, you could add a rejectionReason field to the model and req.body
      // schedule.rejectionReason = req.body.reason; 
    }

    await schedule.save();
    res.status(200).json({ msg: `Vaccination schedule ${decision}d successfully.`, schedule });
  }
);

// GET all vaccines (for dropdowns, parent scheduling)
export const getAllVaccinesList = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Select only necessary fields for parent's dropdown, or return all and let frontend pick
    const vaccines = await Vaccine.find().select('_id name doses description minAgeInMonths maxAgeInMonths').sort({ name: 1 });
    if (!vaccines) {
      // This condition might not be strictly necessary as find() returns [] if nothing found
      res.status(404).json({ msg: "No vaccines found." });
      return;
    }
    res.status(200).json(vaccines);
  }
);

// GET all regions (for dropdowns, parent scheduling)
export const getAllRegionsList = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Select only necessary fields for parent's dropdown
    const regions = await Region.find().select('_id name').sort({ name: 1 }); // Parents might only need ID and name
    if (!regions) {
      res.status(404).json({ msg: "No regions found." });
      return;
    }
    res.status(200).json(regions);
  }
);

// ---- NEW/UPDATED CONTROLLER FOR VACCINE UPDATE ----
export const updateVaccine = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { name, description, doses, minAgeInMonths, maxAgeInMonths } = req.body;

    if (!id) {
        res.status(400).json({ msg: "Vaccine ID is required." });
        return;
    }

    // Basic validation (similar to addVaccine)
    if (!name || doses === undefined || minAgeInMonths === undefined) {
      res.status(400).json({ msg: "Name, doses, and minimum age in months are required." });
      return;
    }
    if (isNaN(parseInt(doses)) || parseInt(doses) <= 0) {
        res.status(400).json({ msg: "Doses must be a positive number." });
        return;
    }
    if (isNaN(parseInt(minAgeInMonths)) || parseInt(minAgeInMonths) < 0) {
        res.status(400).json({ msg: "Minimum age in months must be a non-negative number." });
        return;
    }
    if (maxAgeInMonths !== undefined && maxAgeInMonths !== null && maxAgeInMonths !== '' && (isNaN(parseInt(maxAgeInMonths)) || parseInt(maxAgeInMonths) < parseInt(minAgeInMonths))) {
        res.status(400).json({ msg: "Maximum age in months must be a non-negative number and not less than minimum age." });
        return;
    }

    const vaccine = await Vaccine.findById(id);

    if (!vaccine) {
      res.status(404).json({ msg: "Vaccine not found." });
      return;
    }

    // Check if the new name already exists (for a different vaccine)
    if (name !== vaccine.name) {
      const existingVaccineWithName = await Vaccine.findOne({ name });
      if (existingVaccineWithName) {
        res.status(400).json({ msg: "Another vaccine with this name already exists." });
        return;
      }
    }
    
    vaccine.name = name;
    vaccine.description = description || vaccine.description; // Keep old if not provided
    vaccine.doses = parseInt(doses);
    vaccine.minAgeInMonths = parseInt(minAgeInMonths);
    vaccine.maxAgeInMonths = (maxAgeInMonths !== undefined && maxAgeInMonths !== null && maxAgeInMonths !== '') ? parseInt(maxAgeInMonths) : undefined;


    const updatedVaccine = await vaccine.save();
    res.status(200).json(updatedVaccine);
  }
);

// GET all regions (for Admin view)
export const getAllRegions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const regions = await Region.find({})
      .populate<{ doctor: PopulatedDoc<IUser> }>('doctor', 'name email') 
      .populate<{ venue: PopulatedDoc<IVenue> }>('venue', 'name contact')
      .sort({ name: 1 });
      
    res.status(200).json(regions);
  }
);

export const getVenueListForAdmin = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const venues = await Venue.find().select('_id name').sort({ name: 1 });
    res.status(200).json(venues);
  }
);

export const getAllSchedulesWithDetails = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Implement pagination if needed for large datasets
    // const page = Number(req.query.page) || 1;
    // const limit = Number(req.query.limit) || 20;
    // const skip = (page - 1) * limit;

    const schedules = await VaccinationSchedule.find({}) // Get all
      .populate<{ child: IChild }>("child", "name dob")
      .populate<{ parent: IUser }>("parent", "name email")
      .populate<{ doctor: IUser }>("doctor", "name") // Populate doctor user
      .populate<{ venue: IVenue }>("venue", "name")
      .populate<{ region: IRegion }>("region", "name")
      .populate<{ vaccine: IVaccine }>("vaccine", "name")
      .sort({ createdAt: -1 }); // Sort by creation date descending, or by schedule.date
      // .skip(skip)
      // .limit(limit);

    // const totalSchedules = await VaccinationSchedule.countDocuments({});

    if (!schedules) {
      // This condition might not be hit if find returns an empty array,
      // but it's good for consistency if there was an actual DB error
      res.status(404).json({ msg: "No vaccination schedules found." });
      return;
    }

    res.status(200).json(schedules);
    // For pagination:
    // res.status(200).json({
    //   schedules,
    //   currentPage: page,
    //   totalPages: Math.ceil(totalSchedules / limit),
    //   totalSchedules
    // });
  }
);

//delete a region
export const deleteRegion = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params; // Region ID

    const region = await Region.findById(id);
    if (!region) {
        res.status(404).json({ msg: "Region not found." });
        return;
    }

    // Check if this region is used in any active vaccination schedules
    const activeScheduleUsingRegion = await VaccinationSchedule.findOne({ 
        region: id, 
        status: { $in: ["scheduled", "pending_approval"] } 
    });

    if (activeScheduleUsingRegion) {
        res.status(400).json({ msg: "Region cannot be deleted. It is part of active or pending vaccination schedules. Please resolve these schedules first." });
        return;
    }

    await region.deleteOne();
    res.status(200).json({ msg: "Region deleted successfully." });
});


//delete a venue
export const deleteVenue = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params; // Venue ID

    const venue = await Venue.findById(id);
    if (!venue) {
        res.status(404).json({ msg: "Venue not found." });
        return;
    }

    // 1. Check if this venue is used in any Region
    const regionUsingVenue = await Region.findOne({ venue: id });
    if (regionUsingVenue) {
        res.status(400).json({ msg: `Venue cannot be deleted. It is assigned to region "${regionUsingVenue.name}". Please unassign or delete the region first.` });
        return;
    }

    // 2. Check if this venue is used in any active vaccination schedules (as a fallback, though region check should cover most cases if data is consistent)
    const activeScheduleUsingVenue = await VaccinationSchedule.findOne({
        venue: id,
        status: { $in: ["scheduled", "pending_approval"] }
    });
    if (activeScheduleUsingVenue) {
        res.status(400).json({ msg: "Venue cannot be deleted. It is part of active or pending vaccination schedules (possibly via a direct link before region structure was enforced). Please resolve these schedules first." });
        return;
    }
    
    await venue.deleteOne();
    res.status(200).json({ msg: "Venue deleted successfully." });
});

export const getDashboardStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const pendingSchedulesCount = await VaccinationSchedule.countDocuments({ status: "pending_approval" });
      const totalUsersCount = await User.countDocuments({});
      
      const totalDoctorsCount = await User.countDocuments({ role: "doctor" }); // Using string literal
      // To get total parents, you could count users with 'parent' role:
      // const totalParentsCount = await User.countDocuments({ role: "parent" });
      
      const totalVaccinesCount = await Vaccine.countDocuments({});
      const totalRegionsCount = await Region.countDocuments({});
      const totalVenuesCount = await Venue.countDocuments({});

      res.status(200).json({
        pendingSchedules: pendingSchedulesCount,
        totalUsers: totalUsersCount,
        totalDoctors: totalDoctorsCount,
        totalVaccines: totalVaccinesCount,
        totalRegions: totalRegionsCount,
        totalVenues: totalVenuesCount,
      });

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ msg: "Server error while fetching dashboard statistics." });
    }
  }
);