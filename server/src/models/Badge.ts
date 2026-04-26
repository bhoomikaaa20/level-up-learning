import mongoose, { Schema, Document } from "mongoose";

export interface IBadge extends Document {
    code: string;
    title: string;
    icon: string;
}

const badgeSchema = new Schema({
    code: String,
    title: String,
    icon: String
});

export default mongoose.model<IBadge>("Badge", badgeSchema);