import { GoogleGenAI } from "@google/genai";

import { env } from "../../config/env.js";
import { AppError } from "../../utils/app-error.js";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

/*
 * Canonical nutrient codes our system accepts.
 * Gemini is told to use only these in its response.
 */
const VALID_NUTRIENT_CODES = new Set([
  "VITAMIN_A",
  "VITAMIN_C",
  "VITAMIN_D",
  "VITAMIN_E",
  "VITAMIN_K",
  "CALCIUM",
  "IRON",
  "MAGNESIUM",
  "PHOSPHORUS",
  "POTASSIUM",
  "ZINC"
]);

const EXTRACTION_PROMPT = `
You are a precise nutrition extraction assistant.

Analyze the provided image. It may be:
- A nutrition facts label on a food package
- A photograph of a meal or individual food item

Extract the nutritional information and return ONLY a valid JSON object with this exact structure:

{
  "foodName": "<descriptive name of the food or dish>",
  "quantity": <serving size as a number>,
  "quantityUnit": "<one of: GRAM, MILLILITER, PIECE, SERVING>",
  "calories": <kcal per serving, non-negative number>,
  "proteinG": <grams of protein, non-negative number>,
  "carbsG": <grams of carbohydrates, non-negative number>,
  "fatG": <grams of fat, non-negative number>,
  "confidence": <your overall confidence in accuracy, number between 0 and 1>,
  "micronutrients": [
    { "code": "<NUTRIENT_CODE>", "amount": <amount as a number> }
  ]
}

Rules:
- Valid micronutrient codes: VITAMIN_A, VITAMIN_C, VITAMIN_D, VITAMIN_E, VITAMIN_K, CALCIUM, IRON, MAGNESIUM, PHOSPHORUS, POTASSIUM, ZINC
- Only include micronutrients you can clearly determine from the image
- The micronutrients array may be empty
- All numeric values must be non-negative
- For food/plate images: estimate based on typical nutritional values for visible ingredients
- For nutrition labels: read the exact values printed on the label
- quantityUnit should reflect the serving size unit (GRAM for weight-based, MILLILITER for liquids, SERVING for packaged foods, PIECE for countable items)
- Return ONLY the JSON object, no extra text, no markdown, no code blocks
`.trim();

/**
 * Normalise and validate the raw JSON object returned by Gemini.
 * Throws an AppError if the output is structurally invalid so the
 * caller gets a clean 422 rather than a cryptic 500.
 */
function normaliseExtraction(raw) {
  const foodName = typeof raw.foodName === "string" && raw.foodName.trim()
    ? raw.foodName.trim().slice(0, 200)
    : null;

  if (!foodName) {
    throw new AppError(
      "AI could not determine the food name from this image",
      422,
      "AI_EXTRACTION_FAILED"
    );
  }

  const quantity = Number(raw.quantity);
  const calories = Number(raw.calories);
  const proteinG = Number(raw.proteinG);
  const carbsG   = Number(raw.carbsG);
  const fatG     = Number(raw.fatG);
  const confidence = Math.min(1, Math.max(0, Number(raw.confidence ?? 0.5)));

  const validUnits = ["GRAM", "MILLILITER", "PIECE", "SERVING"];
  const quantityUnit = validUnits.includes(raw.quantityUnit)
    ? raw.quantityUnit
    : "SERVING";

  // Any field that isn't a finite, non-negative number is a sign the
  // model couldn't extract enough info.
  const numeric = { quantity, calories, proteinG, carbsG, fatG };
  for (const [key, val] of Object.entries(numeric)) {
    if (!Number.isFinite(val) || val < 0) {
      throw new AppError(
        `AI could not determine a valid value for "${key}" from this image`,
        422,
        "AI_EXTRACTION_FAILED"
      );
    }
  }

  // Filter micronutrients to only known codes with valid amounts.
  const micronutrients = Array.isArray(raw.micronutrients)
    ? raw.micronutrients
        .filter(
          (m) =>
            VALID_NUTRIENT_CODES.has(m.code) &&
            Number.isFinite(Number(m.amount)) &&
            Number(m.amount) >= 0
        )
        .map((m) => ({
          code:   m.code,
          amount: Number(m.amount)
        }))
    : [];

  return {
    foodName,
    quantity,
    quantityUnit,
    calories,
    proteinG,
    carbsG,
    fatG,
    aiConfidence: confidence,
    micronutrients
  };
}

/**
 * Send an image to Gemini and return structured nutrition data.
 *
 * @param {string} imageData - Base64-encoded image (no data URI prefix)
 * @param {string} mimeType  - Image MIME type
 */
export async function extractNutrition(imageData, mimeType) {
  let responseText;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          parts: [
            { text: EXTRACTION_PROMPT },
            {
              inlineData: {
                mimeType,
                data: imageData
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    responseText = response.text.trim();
  } catch (error) {
    // Log the actual Gemini error so we can diagnose API key / quota / network issues
    console.error("[AI] Gemini request failed:", error?.message ?? error);
    throw new AppError(
      "Failed to reach the AI service. Please try again.",
      502,
      "AI_SERVICE_ERROR"
    );
  }

  let parsed;

  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new AppError(
      "AI returned an unexpected response. Please try a clearer image.",
      422,
      "AI_EXTRACTION_FAILED"
    );
  }

  return normaliseExtraction(parsed);
}
