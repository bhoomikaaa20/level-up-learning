import mongoose, { Schema, Document } from "mongoose";

export interface IDailyChallenge extends Document {
    challenge_date: string;
    question_ids: string[];
    bonus_xp: number;
    bonus_coins: number;
}

const schema = new Schema<IDailyChallenge>({
    challenge_date: { type: String, unique: true },
    question_ids: [String],
    bonus_xp: Number,
    bonus_coins: Number
});

export default mongoose.model<IDailyChallenge>("DailyChallenge", schema);