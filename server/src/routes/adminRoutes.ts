import express from "express";
import {
    getAdminData,
    saveSubject,
    deleteSubject,
    saveLevel,
    deleteLevel
} from "../controllers/adminController";
import { protect } from "../middleware/authMiddleware";
import { getAdminStats } from "../controllers/adminController";
import { getTopPlayers } from "../controllers/adminController";
import {
    getLevels,
    getQuestions,
    saveQuestion,
    deleteQuestion
} from "../controllers/adminController";

import { getUsers, toggleBanUser } from "../controllers/adminController";



const router = express.Router();

router.get("/", protect, getAdminData);

router.post("/subject", protect, saveSubject);
router.delete("/subject/:id", protect, deleteSubject);
router.post("/level", protect, saveLevel);
router.delete("/level/:id", protect, deleteLevel);
router.get("/stats", protect, getAdminStats);
router.get("/top-players", protect, getTopPlayers);
router.get("/levels", protect, getLevels);
router.get("/questions", protect, getQuestions);
router.post("/question", protect, saveQuestion);
router.delete("/question/:id", protect, deleteQuestion);
router.get("/users", protect, getUsers);
router.patch("/users/:id/ban", protect, toggleBanUser);


export default router;