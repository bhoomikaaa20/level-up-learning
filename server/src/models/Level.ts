import mongoose, { Schema, Document } from "mongoose";

export interface ILevel extends Document {
    title: string;
    xp_reward: number;
    tier: string;
}

const schema = new Schema<ILevel>({
    title: String,
    xp_reward: Number,
    tier: String
});

export default mongoose.model<ILevel>("Level", schema);