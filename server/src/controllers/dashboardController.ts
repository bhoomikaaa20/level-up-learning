import { Request, Response } from "express";
import User from "../models/User";
import Progress from "../models/Progress";
import UserBadge from "../models/UserBadge";

export const getDashboard = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        // PROFILE
        const user = await User.findById(userId);

        // PROGRESS
        const progress = await Progress.find({ user: userId }).sort({ played_at: -1 });

        // BADGES
        const badges = await UserBadge.find({ user: userId }).populate("badge");

        // CALCULATIONS
        const completed = progress.filter(p => p.completed).length;

        const totalQs = progress.reduce((a, b) => a + (b.total_questions || 0), 0);
        const totalCorrect = progress.reduce((a, b) => a + (b.correct_count || 0), 0);

        const accuracy = totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0;

        const recent = progress.slice(0, 8);

        res.json({
            profile: {
                display_name: user?.displayName,
                xp: user?.xp,
                coins: user?.coins,
                streak: user?.streak
            },
            completed,
            accuracy,
            recent,
            badges: badges.map((b: any) => ({
                badge_id: b._id,
                awarded_at: b.awarded_at,
                badge: b.badge
            }))
        });

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};