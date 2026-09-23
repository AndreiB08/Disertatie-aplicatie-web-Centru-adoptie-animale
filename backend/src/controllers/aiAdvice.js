import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getPetCareAdvice = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Missing message" });
    }

    try {
        // TEMPORAR:
        // const aiResponse = `Mock răspuns pentru mesaj (mă costă bani sunt sărăcie): "${message}"`;
        // res.json({ advice: aiResponse });

        // ORIGINAL:
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
        });

        const aiResponse = response.choices[0].message.content;
        res.json({ advice: aiResponse });

    } catch (error) {
        console.error("AI Chat Error:", error.message);
        res.status(500).json({ error: "Failed to get advice from AI." });
    }
};
