
import express from 'express';
import {
  getAllUsers,
  deleteUser,
  createDoctor,
  addRegion,
  addVenue,
  addVaccine,
  deleteVaccinationSchedule,
} from '../controllers/adminController';

import { protect, isAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

// User
router.get('/users', protect, isAdmin, getAllUsers);
router.delete('/user/:id', protect, isAdmin, deleteUser);

// Doctor
router.post('/doctor', protect, isAdmin, createDoctor);

// Region
router.post('/region', protect, isAdmin, addRegion);

// Venue
router.post('/venue', protect, isAdmin, addVenue);

// Vaccine
router.post('/vaccine', protect, isAdmin, addVaccine);

// Vaccination Schedule
router.delete('/vaccination/:id', protect, isAdmin, deleteVaccinationSchedule);

export default router;