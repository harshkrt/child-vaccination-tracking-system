import { Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { User } from "../models/User";
import { Region } from "../models/Region";
import { Vaccine } from "../models/Vaccine";
import { VaccinationSchedule } from "../models/VaccinationSchedule";
import { Venue } from "../models/Venue";

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

    //check if same doctor already exists
    const existingDoc = await User.findOne({ email });
    if (existingDoc) {
      res.status(400).json({ msg: "Doctor already exists." });
      return;
    }

    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);

    //create a new doctor
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
    const { villageName, doctor, venue } = req.body;

    if (!villageName || !doctor || !venue) {
      res.status(400).json({ msg: "Please provide all required details." });
      return;
    }
    const existingRegion = await Region.find({ villageName });
    
    if (existingRegion) {
        res.status(400).json({ msg: "Region already exists." });
    }

    const region = await Region.create({
      villageName,
      doctor,
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

    const existingVenue = await Venue.find({ name });
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
    const { name, description, doses } = req.body;

    if (!name || !description || !doses) {
        res.status(400).json({ msg: "Please provide all required details." });
        return;
    }

    const existingVaccine = await Vaccine.find({ name });
    if (existingVaccine) {
        res.status(400).json({ msg: "Vaccine already exists." });
        return;
    }

    const vaccine = await Vaccine.create({
        name,
        description,
        doses,
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

        const status = ["completed", "cancelled", "missed"];

        if (!status.includes(schedule.status)) {
            res.status(400).json({ msg: "Vaccination schedule cannot be deleted." });
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

    await vaccine.deleteOne();
    res.status(200).json({ msg: "Vaccine deleted successfully." });
});
