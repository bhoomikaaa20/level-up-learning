import express from "express";
import { getQuiz, submitQuiz } from "../controllers/quizController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/:levelId", protect, getQuiz);
router.post("/submit", protect, submitQuiz);

export default router;