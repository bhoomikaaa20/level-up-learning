import { Request, Response } from "express";
import Level from "../models/Level";
import Question from "../models/Question";
import Progress from "../models/Progress";
import User from "../models/User";
import UserBadge from "../models/UserBadge";
import Badge from "../models/Badge";

// GET QUIZ
export const getQuiz = async (req: Request, res: Response) => {
    try {
        const { levelId } = req.params;

        const level = await Level.findById(levelId);
        const questions = await Question.find({ level_id: levelId });

        const shuffled = questions.sort(() => Math.random() - 0.5);

        res.json({ level, questions: shuffled });

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// SUBMIT QUIZ
export const submitQuiz = async (req: Request, res: Response) => {
    try {
        const { levelId, correctCount, totalQuestions, streak } = req.body;
        const userId = (req as any).user._id;

        const level = await Level.findById(levelId);

        const score = Math.round((correctCount / totalQuestions) * 100);

        const baseXp = Math.round(level!.xp_reward * (correctCount / totalQuestions));
        const bonus = streak >= 3 ? 25 : 0;
        const xp = baseXp + bonus;
        const coins = Math.round(score / 10) * 5;

        // SAVE PROGRESS
        await Progress.create({
            user: userId,
            level_id: levelId,
            level_title: level?.title,
            score,
            total_questions: totalQuestions,
            correct_count: correctCount,
            xp_earned: xp,
            completed: score >= 60
        });

        // UPDATE USER
        const user = await User.findByIdAndUpdate(userId, {
            $inc: { xp, coins }
        }, { new: true });

        // BADGES
        await handleBadges(userId, level, user, score);

        res.json({ xp, coins, score });

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

const handleBadges = async (userId: string, level: any, user: any, score: number) => {
    // first quiz
    const count = await Progress.countDocuments({ user: userId });
    if (count === 1) await awardBadge(userId, "first_quiz");

    if (score >= 60) {
        if (level?.tier === "Beginner") await awardBadge(userId, "beginner_master");
        if (level?.tier === "Intermediate") await awardBadge(userId, "intermediate_master");
        if (level?.tier === "Advanced") await awardBadge(userId, "advanced_master");
    }

    if (user?.xp >= 1000) await awardBadge(userId, "xp_1000");
};

const awardBadge = async (userId: string, code: string) => {
    const badge = await Badge.findOne({ code });
    if (!badge) return;

    const exists = await UserBadge.findOne({ user: userId, badge: badge._id });
    if (exists) return;

    await UserBadge.create({
        user: userId,
        badge: badge._id
    });
};