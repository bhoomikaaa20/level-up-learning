import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    email: string;
    password: string;
    displayName: string;
    role: "user" | "admin";

    xp: number;
    coins: number;
    streak: number;

    banned: boolean; // ✅ added

    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        displayName: {
            type: String,
            required: true,
            trim: true
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        xp: {
            type: Number,
            default: 0
        },

        coins: {
            type: Number,
            default: 0
        },

        streak: {
            type: Number,
            default: 0
        },

        // ✅ NEW FIELD (for Admin panel)
        banned: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IUser>("User", userSchema);