import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: "Username and password required" });

    try {
        const existing = await User.findOne({ username });
        if (existing) return res.status(409).json({ error: "Username already taken" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hashed });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, username: user.username });
    } catch (err) {
        res.status(500).json({ error: "Registration failed" });
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: "Username and password required" });

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, username: user.username });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

export default router;
