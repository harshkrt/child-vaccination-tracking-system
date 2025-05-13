import express from 'express';
import { addChild, getChildren, scheduleVaccination, getVaccinationSchedule, cancelVaccination } from '../controllers/parentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// add a child 
router.post('/add-child', protect, addChild);

//get all the added children of a parent
router.get('/children', protect, getChildren);

//schedule a vaccination
router.post('/schedule', protect, scheduleVaccination);

//get vaccination schedule
router.get('/vaccination', protect, getVaccinationSchedule);

//cancel vaccination
router.delete('/cancel-vaccination/:id', protect, cancelVaccination);

export default router;
