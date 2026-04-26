import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import subjectRoutes from "./routes/subjectRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import dailyRoutes from "./routes/dailyRoutes";
import leaderboardRoutes from "./routes/leaderboardRoutes";
import quizRoutes from "./routes/quizRoutes";

import adminRoutes from "./routes/adminRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/daily", dailyRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/admin", adminRoutes);


export default app;