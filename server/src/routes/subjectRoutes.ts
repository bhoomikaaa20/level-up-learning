import express from "express";
import { getSubjects } from "../controllers/subjectController";
import { getSubjectLevels } from "../controllers/subjectController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getSubjects);
router.get("/:subjectId/levels", protect, getSubjectLevels);



export default router;  