import { generateAIResponse } from "../services/ai.service.js";

const askAI = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    const answer = await generateAIResponse(query);

    return res.status(200).json({
      success: true,
      type: "normal",
      answer,
    });
  } catch (error) {
    console.error("Gemini AI Error:", error);

    return res.status(500).json({
      success: false,
      message: "AI service failed",
    });
  }
};

export { askAI };