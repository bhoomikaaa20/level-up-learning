import mongoose, { Document, Schema } from "mongoose";

export interface IProgress extends Document {
    user: string;
    level_id: string;
    score: number;
    xp_earned: number;
    total_questions: number;
    correct_count: number;
    completed: boolean;
    played_at: Date;
    level_title: string;
}

const progressSchema = new Schema<IProgress>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    level_id: String,
    level_title: String,
    score: Number,
    xp_earned: Number,
    total_questions: Number,
    correct_count: Number,
    completed: Boolean,
    played_at: { type: Date, default: Date.now }
});

export default mongoose.model<IProgress>("Progress", progressSchema);