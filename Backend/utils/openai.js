import "dotenv/config";

// Text-only model (fast, reliable)
const TEXT_MODEL = "openai/gpt-oss-20b:free";
// Vision model (for image analysis)
const VISION_MODEL = "google/gemma-4-26b-a4b-it:free";

const callOpenRouter = async (model, messages) => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({ model, messages })
    });
    const data = await response.json();
    if (!response.ok || !data.choices) {
        console.log("OpenRouter error:", JSON.stringify(data));
        throw new Error(data.error?.message || "OpenRouter API error");
    }
    return data.choices[0].message.content;
};

const getOpenAIAPIResponse = async (message, imageBase64 = null) => {
    try {
        if (imageBase64) {
            // Vision request
            const userContent = [
                { type: "text", text: message || "Analyze this image." },
                { type: "image_url", image_url: { url: imageBase64 } }
            ];
            return await callOpenRouter(VISION_MODEL, [{ role: "user", content: userContent }]);
        } else {
            // Text-only request
            return await callOpenRouter(TEXT_MODEL, [{ role: "user", content: message }]);
        }
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export default getOpenAIAPIResponse;
