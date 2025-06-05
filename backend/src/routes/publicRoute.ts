// src/routes/publicRoute.ts
import express from 'express';
// Assuming you've put getAllVaccinesList and getAllRegionsList in a controller accessible here
// For example, if they are in adminController (adjust import path)
import { getAllVaccinesList, getAllRegionsList } from '../controllers/adminController';
import { protect } from '../middlewares/authMiddleware'; // Optional: if only authenticated users can see them

const router = express.Router();

// If public (no auth needed):
router.get('/vaccines', getAllVaccinesList);
router.get('/regions', getAllRegionsList);

// If only for authenticated users (parents, doctors, admins):
// router.get('/vaccines', protect, getAllVaccinesList);
// router.get('/regions', protect, getAllRegionsList);

export default router;