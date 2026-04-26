import express from "express";
import { getDailyChallenge, submitDaily } from "../controllers/dailyController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, getDailyChallenge);
router.post("/submit", protect, submitDaily);

export default router;