import express from "express";
import { registerUser, loginUser, getProfile } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/signin", loginUser);
router.get("/profile", protect, getProfile);

export default router;