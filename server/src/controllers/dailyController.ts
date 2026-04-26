import { Request, Response } from "express";
import DailyChallenge from "../models/DailyChallenge";
import Question from "../models/Question";
import DailyCompletion from "../models/DailyCompletion";
import User from "../models/User";

export const getDailyChallenge = async (req: Request, res: Response) => {
    try {
        const today = new Date().toISOString().slice(0, 10);

        let challenge = await DailyChallenge.findOne({ challenge_date: today });

        // ✅ Auto generate
        if (!challenge) {
            const pool = await Question.find().limit(200);

            if (pool.length >= 5) {
                const shuffled = pool.sort(() => Math.random() - 0.5);
                const ids = shuffled.slice(0, 5).map(q => q._id.toString());

                challenge = await DailyChallenge.create({
                    challenge_date: today,
                    question_ids: ids,
                    bonus_xp: 100,
                    bonus_coins: 25
                });
            }
        }

        if (!challenge) return res.json(null);

        // check completion
        const completed = await DailyCompletion.findOne({
            user: (req as any).user._id,
            challenge: challenge._id
        });

        const questions = await Question.find({
            _id: { $in: challenge.question_ids }
        });

        res.json({
            challenge,
            completed: !!completed,
            questions
        });

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const submitDaily = async (req: Request, res: Response) => {
    try {
        const { challengeId, score } = req.body;
        const userId = (req as any).user._id;

        const challenge = await DailyChallenge.findById(challengeId);

        await DailyCompletion.create({
            user: userId,
            challenge: challengeId,
            score
        });

        // ✅ Update user rewards
        await User.findByIdAndUpdate(userId, {
            $inc: {
                xp: challenge?.bonus_xp || 0,
                coins: challenge?.bonus_coins || 0,
                streak: 1
            }
        });

        res.json({
            xp: challenge?.bonus_xp,
            coins: challenge?.bonus_coins
        });

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};