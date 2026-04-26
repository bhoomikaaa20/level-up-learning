import { Request, Response } from "express";
import User from "../models/User";
import Progress from "../models/Progress";

// GLOBAL LEADERBOARD
export const getGlobalLeaderboard = async (req: Request, res: Response) => {
    try {
        const users = await User.find()
            .select("_id displayName xp")
            .sort({ xp: -1 })
            .limit(50);

        const result = users.map((u) => ({
            id: u._id,
            display_name: u.displayName,
            xp: u.xp,
            avatar_url: null
        }));

        res.json(result);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// WEEKLY LEADERBOARD
export const getWeeklyLeaderboard = async (req: Request, res: Response) => {
    try {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const progress = await Progress.find({
            played_at: { $gte: weekAgo }
        }).populate("user", "displayName");

        const map = new Map<string, any>();

        progress.forEach((p: any) => {
            const userId = p.user._id.toString();

            if (map.has(userId)) {
                map.get(userId).weekly_xp += p.xp_earned;
            } else {
                map.set(userId, {
                    user_id: userId,
                    display_name: p.user.displayName,
                    weekly_xp: p.xp_earned
                });
            }
        });

        const result = Array.from(map.values())
            .sort((a, b) => b.weekly_xp - a.weekly_xp)
            .slice(0, 50);

        res.json(result);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};