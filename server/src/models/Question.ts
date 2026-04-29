import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
    question: string;
    options: string[];
    correct_answer: string;
    explanation?: string;
    level_id: mongoose.Types.ObjectId;
    time_seconds: number;
}

const questionSchema = new Schema<IQuestion>({
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correct_answer: { type: String, required: true },
    explanation: { type: String },

    // ✅ FIXED
    subject_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },
    level_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Level",
        required: true
    },

    time_seconds: {
        type: Number,
        default: 30
    }
}, { timestamps: true });

export default mongoose.model<IQuestion>("Question", questionSchema);