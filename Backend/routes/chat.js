import express from "express";
import Thread from "../models/Thread.js";
import getOpenAIAPIResponse from "../utils/openai.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// All routes require auth
router.use(authMiddleware);

// Get all threads for current user
router.get("/thread", async (req, res) => {
    try {
        const threads = await Thread.find({ userId: req.userId }).sort({ updatedAt: -1 });
        res.json(threads);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch threads" });
    }
});

// Get messages of a thread
router.get("/thread/:threadId", async (req, res) => {
    try {
        const thread = await Thread.findOne({ threadId: req.params.threadId, userId: req.userId });
        if (!thread) return res.status(404).json({ error: "Thread not found" });
        res.json(thread.messages);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch chat" });
    }
});

// Delete a thread
router.delete("/thread/:threadId", async (req, res) => {
    try {
        const deleted = await Thread.findOneAndDelete({ threadId: req.params.threadId, userId: req.userId });
        if (!deleted) return res.status(404).json({ error: "Thread not found" });
        res.json({ success: "Thread deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete thread" });
    }
});

// Send a message
router.post("/chat", async (req, res) => {
    const { threadId, message } = req.body;
    if (!threadId || !message)
        return res.status(400).json({ error: "Missing required fields" });

    try {
        let thread = await Thread.findOne({ threadId, userId: req.userId });

        if (!thread) {
            thread = new Thread({
                threadId,
                userId: req.userId,
                title: message.slice(0, 60),
                messages: [{ role: "user", content: message }]
            });
        } else {
            thread.messages.push({ role: "user", content: message });
        }

        const assistantReply = await getOpenAIAPIResponse(message);
        thread.messages.push({ role: "assistant", content: assistantReply });
        thread.updatedAt = new Date();

        await thread.save();
        res.json({ reply: assistantReply });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

export default router;
