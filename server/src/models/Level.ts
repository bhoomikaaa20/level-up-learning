import mongoose, { Schema, Document } from "mongoose";

export interface ILevel extends Document {
    title: string;
    xp_reward: number;
    tier: string;
    subject_id: mongoose.Types.ObjectId;
    unlock_coins: number;
    order_index: number;
}

const schema = new Schema<ILevel>({
    title: { type: String, required: true },
    xp_reward: { type: Number, default: 50 },
    tier: { type: String, default: "Beginner" },
    subject_id: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    unlock_coins: { type: Number, default: 0 },
    order_index: { type: Number, required: true }
});

export default mongoose.model<ILevel>("Level", schema);