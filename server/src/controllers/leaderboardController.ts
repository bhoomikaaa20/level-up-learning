import { Request, Response } from "express";
import User from "../models/User";
import Progress from "../models/Progress";

// GLOBAL
export const getGlobalLeaderboard = async (req: Request, res: Response) => {
    try {
        const users = await User.find()
            .select("_id displayName xp")
            .sort({ xp: -1 })
            .limit(50);

        res.json(
            users.map((u) => ({
                id: u._id,
                display_name: u.displayName,
                xp: u.xp
            }))
        );
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// WEEKLY
export const getWeeklyLeaderboard = async (req: Request, res: Response) => {
    try {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const progress = await Progress.find({
            played_at: { $gte: weekAgo }
        }).populate("user", "displayName");

        const map = new Map<string, any>();

        progress.forEach((p: any) => {
            const id = p.user._id.toString();

            if (map.has(id)) {
                map.get(id).weekly_xp += p.xp_earned;
            } else {
                map.set(id, {
                    user_id: id,
                    display_name: p.user.displayName,
                    weekly_xp: p.xp_earned
                });
            }
        });

        res.json(
            Array.from(map.values()).sort((a, b) => b.weekly_xp - a.weekly_xp)
        );
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};