import express from 'express';
import { getVaccinationSchedules, completeVaccination } from '../controllers/doctorController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/vaccinations', protect, getVaccinationSchedules);
router.put('/complete-vaccination/:id', protect, completeVaccination);

export default router;