import { extractNutrition, chatWithData } from "./ai.service.js";

export async function extractNutritionController(req, res) {
  const { imageData, mimeType } = req.body;

  const data = await extractNutrition(imageData, mimeType);

  res.status(200).json({ data });
}

export async function chatController(req, res) {
  const { message, history } = req.body;
  const userId = req.user.id;

  const reply = await chatWithData(userId, message, history);

  res.status(200).json({ data: { reply } });
}
