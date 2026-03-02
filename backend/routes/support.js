const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = (knowledgeCollection) => {
    const router = express.Router();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    router.post("/chat", async (req, res) => {
        try {
            const { message, history } = req.body;

            if (!message || message.trim() === "") {
                return res.status(400).json({ error: "Message missing" });
            }

            const config = await knowledgeCollection.findOne({ type: "instruction" });
            const systemPrompt = config?.content || "You are OnWay Support AI, a ride-sharing platform assistant.";

            const knowledgeData = await knowledgeCollection
                .find({ $text: { $search: message } })
                .limit(3)
                .toArray();

            const hasKnowledge = knowledgeData.length > 0;
            const knowledgeText = hasKnowledge
                ? knowledgeData.map(k => `Q: ${k.question}\nA: ${k.answer}`).join("\n\n")
                : "No specific technical documentation found for this query.";

            const model = genAI.getGenerativeModel({
                model: "models/gemini-2.5-flash",
                systemInstruction: systemPrompt
            });

            let cleanHistory = (history || []).filter(
                msg => msg.role === "user" || msg.role === "model"
            );

            if (cleanHistory.length > 0 && cleanHistory[0].role !== "user") {
                cleanHistory = cleanHistory.slice(1);
            }

            const chat = model.startChat({
                history: cleanHistory
            });

            const finalMessage = `
            ${hasKnowledge ? `Use the following context to answer: \n${knowledgeText}` : "Answer the user based on your general knowledge about OnWay."}
            
            User Question: ${message}
            
            Note: If the question is totally unrelated to OnWay or ride-sharing, politely say you don't know.
            `;

            const result = await chat.sendMessage(finalMessage);
            const reply = result.response.text();

            res.json({ reply });

        } catch (error) {
            console.error("AI Error:", error);
            res.status(500).json({ error: "AI Error", details: error.message });
        }
    });

    router.get("/admin/config", async (req, res) => {
        try {
            const config = await knowledgeCollection.findOne({ type: "instruction" });
            res.json(config || { content: "" });
        } catch (e) {
            res.status(500).json({ error: "DB Error" });
        }
    });

    router.post("/admin/update", async (req, res) => {
        const { content } = req.body;
        if (!content) return res.status(400).json({ error: "Content required" });

        await knowledgeCollection.updateOne(
            { type: "instruction" },
            { $set: { content, updatedAt: new Date() } },
            { upsert: true }
        );

        res.json({ success: true });
    });

    return router;
};