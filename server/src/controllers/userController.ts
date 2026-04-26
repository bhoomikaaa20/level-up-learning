import { Request, Response } from "express";
import User from "../models/User";

// GET PROFILE
export const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById((req as any).user._id).select(
            "displayName xp coins streak"
        );

        res.json({
            display_name: user?.displayName,
            xp: user?.xp,
            coins: user?.coins,
            streak: user?.streak
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};