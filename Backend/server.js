import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = 8080;

app.use(express.json({ limit: "10mb" }));
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://sigma-gpt-project.vercel.app",
        /\.vercel\.app$/
    ],
    credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    connectDB();

    // Keep-alive ping every 14 minutes to prevent Render free tier sleep
    const RENDER_URL = process.env.RENDER_URL;
    if (RENDER_URL) {
        setInterval(async () => {
            try {
                await fetch(`${RENDER_URL}/api/auth/login`);
                console.log("Keep-alive ping sent");
            } catch (err) {
                console.log("Keep-alive ping failed:", err.message);
            }
        }, 14 * 60 * 1000);
    }
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to Database!");
    } catch (err) {
        console.log("Failed to connect to DB", err);
    }
};
