import express from 'express';
import {
  getAllUsers,
  deleteUser,
  createDoctor,
  addRegion,
  addVenue,
  addVaccine,
  deleteVaccinationSchedule,
  deleteVaccine,
  getPendingApprovalSchedules,
  reviewVaccinationSchedule,
  updateVaccine, 
  getAllRegions,
  getVenueListForAdmin,
  getAllSchedulesWithDetails,
  deleteVenue,
  deleteRegion,
  getDashboardStats,
} from '../controllers/adminController';

import { protect, isAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

// User Management
router.get('/users', protect, isAdmin, getAllUsers);
router.delete('/user/:id', protect, isAdmin, deleteUser);

// Doctor Management (User with role 'doctor')
router.post('/doctor', protect, isAdmin, createDoctor);

// Region Management
router.post('/region', protect, isAdmin, addRegion);
router.get('/regions', protect, isAdmin, getAllRegions); 
router.delete('/region/:id', protect, isAdmin, deleteRegion);

// Venue Management
router.post('/venue', protect, isAdmin, addVenue);
router.get('/venues-list', protect, isAdmin, getVenueListForAdmin);
router.delete('/venue/:id', protect, isAdmin, deleteVenue);

// Vaccine Management
router.post('/vaccine', protect, isAdmin, addVaccine);
router.put('/vaccine/:id', protect, isAdmin, updateVaccine);
router.delete('/vaccine/:id', protect, isAdmin, deleteVaccine);


// Vaccination Schedule Management
router.delete('/vaccination/:id', protect, isAdmin, deleteVaccinationSchedule);

// New routes for Admin Verification of Schedules
router.get('/vaccinations/pending', protect, isAdmin, getPendingApprovalSchedules);
router.get('/vaccinations/all-details', protect, isAdmin, getAllSchedulesWithDetails);
router.put('/vaccination/:id/review', protect, isAdmin, reviewVaccinationSchedule);
router.delete('/vaccination/:id', protect, isAdmin, deleteVaccinationSchedule);

// Dashboard Stats Route
router.get('/dashboard-stats', protect, isAdmin, getDashboardStats);
export default router;