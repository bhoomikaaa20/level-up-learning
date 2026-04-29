import User from "../models/User";
import Subject from "../models/Subject";
import Question from "../models/Question";
import Progress from "../models/Progress";
import { Request, Response } from "express";
import Level from "../models/Level";

// GET ALL
export const getAdminData = async (req: Request, res: Response) => {
    try {
        const subjects = await Subject.find().sort({ title: 1 });
        const levels = await Level.find().sort({ order_index: 1 });

        res.json({ subjects, levels });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// SAVE SUBJECT (ADD/UPDATE)
export const saveSubject = async (req: Request, res: Response) => {
    try {
        const { id, ...data } = req.body;

        if (id) {
            const updated = await Subject.findByIdAndUpdate(id, data, { new: true });
            return res.json(updated);
        }

        const subject = await Subject.create(data);
        res.json(subject);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE SUBJECT
export const deleteSubject = async (req: Request, res: Response) => {
    try {
        await Subject.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// SAVE LEVEL (ADD/UPDATE)
export const saveLevel = async (req: Request, res: Response) => {
    try {
        const { id, ...data } = req.body;

        if (id) {
            const updated = await Level.findByIdAndUpdate(id, data, { new: true });
            return res.json(updated);
        }

        const level = await Level.create(data);
        res.json(level);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE LEVEL
export const deleteLevel = async (req: Request, res: Response) => {
    try {
        await Level.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};


export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const [users, subjects, questions, attempts] = await Promise.all([
            User.countDocuments(),
            Subject.countDocuments(),
            Question.countDocuments(),
            Progress.countDocuments()
        ]);

        res.json({
            users,
            subjects,
            questions,
            attempts
        });

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getTopPlayers = async (req: Request, res: Response) => {
    try {
        const players = await User.find()
            .select("displayName xp coins streak")
            .sort({ xp: -1 })
            .limit(10);

        const formatted = players.map((p) => ({
            display_name: p.displayName,
            xp: p.xp,
            coins: p.coins,
            streak: p.streak
        }));

        res.json(formatted);

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};


// GET LEVELS
export const getLevels = async (req: Request, res: Response) => {
    try {
        const levels = await Level.find().sort({ order_index: 1 });
        res.json(levels);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// GET QUESTIONS (OPTIONAL FILTER)
export const getQuestions = async (req: Request, res: Response) => {
    try {
        const { levelId } = req.query;

        let query: any = {};
        if (levelId && levelId !== "all") {
            query.level_id = levelId;
        }

        const questions = await Question.find(query)
            .sort({ createdAt: -1 })
            .limit(200);

        res.json(questions);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// ADD / UPDATE
export const saveQuestion = async (req: Request, res: Response) => {
    try {
        const { id, ...data } = req.body;

        if (id) {
            const updated = await Question.findByIdAndUpdate(id, data, { new: true });
            return res.json(updated);
        }

        const created = await Question.create(data);
        res.json(created);

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE
export const deleteQuestion = async (req: Request, res: Response) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};


// GET USERS
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find()
            .select("_id displayName xp coins streak banned createdAt")
            .sort({ xp: -1 });

        const formatted = users.map((u) => ({
            id: u._id,
            display_name: u.displayName,
            xp: u.xp,
            coins: u.coins,
            streak: u.streak,
            banned: u.banned,
            created_at: u.createdAt
        }));

        res.json(formatted);

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// TOGGLE BAN
export const toggleBanUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.banned = !user.banned;
        await user.save();

        res.json({ banned: user.banned });

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};