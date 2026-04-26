import { Request, Response } from "express";
import Subject from "../models/Subject";
import Level from "../models/Level";
import Progress from "../models/Progress";
import User from "../models/User";

// GET ALL SUBJECTS
export const getSubjects = async (req: Request, res: Response) => {
    try {
        const subjects = await Subject.find().sort({ title: 1 });

        res.json(subjects);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getSubjectLevels = async (req: Request, res: Response) => {
    try {
        const { subjectId } = req.params;
        const userId = (req as any).user._id;

        // SUBJECT
        const subject = await Subject.findById(subjectId);

        // LEVELS
        const levels = await Level.find({ subject_id: subjectId }).sort({ order_index: 1 });

        // PROGRESS
        const progress = await Progress.find({ user: userId });

        // USER COINS
        const user = await User.findById(userId);

        res.json({
            subjectTitle: subject?.title,
            levels,
            progress,
            coins: user?.coins || 0
        });

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};