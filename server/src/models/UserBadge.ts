import mongoose, { Schema, Document } from "mongoose";

export interface IUserBadge extends Document {
    user: string;
    badge: string;
    awarded_at: Date;
}

const userBadgeSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    badge: { type: mongoose.Schema.Types.ObjectId, ref: "Badge" },
    awarded_at: { type: Date, default: Date.now }
});

export default mongoose.model<IUserBadge>("UserBadge", userBadgeSchema);