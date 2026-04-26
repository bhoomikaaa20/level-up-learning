import mongoose, { Document, Schema } from "mongoose";

export interface ISubject extends Document {
    title: string;
    description?: string;
    icon: string;
}

const subjectSchema = new Schema<ISubject>(
    {
        title: { type: String, required: true },
        description: { type: String },
        icon: { type: String }
    },
    { timestamps: true }
);

export default mongoose.model<ISubject>("Subject", subjectSchema);