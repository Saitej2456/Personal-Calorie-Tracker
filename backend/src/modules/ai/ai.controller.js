import { extractNutrition } from "./ai.service.js";

export async function extractNutritionController(req, res) {
  const { imageData, mimeType } = req.body;

  const data = await extractNutrition(imageData, mimeType);

  res.status(200).json({ data });
}
