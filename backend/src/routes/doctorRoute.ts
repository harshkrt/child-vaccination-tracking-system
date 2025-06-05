import express from 'express';
import { getVaccinationSchedules, completeVaccination, getDoctorDashboardStats } from '../controllers/doctorController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/vaccinations', protect, getVaccinationSchedules);
router.put('/complete-vaccination/:id', protect, completeVaccination);
router.get('/dashboard-stats', protect, getDoctorDashboardStats); 

export default router;