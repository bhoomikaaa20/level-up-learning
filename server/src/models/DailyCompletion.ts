import mongoose, { Schema } from "mongoose";

const schema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: "DailyChallenge" },
    score: Number
});

export default mongoose.model("DailyCompletion", schema);