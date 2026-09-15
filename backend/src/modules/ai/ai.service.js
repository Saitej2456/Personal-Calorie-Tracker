import { GoogleGenAI } from "@google/genai";

import { env } from "../../config/env.js";
import { AppError } from "../../utils/app-error.js";
import { createFoodEntry, listFoodEntries } from "../food-entry/food-entry.service.js";
import { createGoal, listGoals } from "../goal/goal.service.js";
import { getGoalComparison, getCalorieReport, getMacroReport } from "../report/report.service.js";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

const VALID_NUTRIENT_CODES = new Set([
  "VITAMIN_A", "VITAMIN_C", "VITAMIN_D", "VITAMIN_E", "VITAMIN_K",
  "CALCIUM", "IRON", "MAGNESIUM", "PHOSPHORUS", "POTASSIUM", "ZINC"
]);

const EXTRACTION_PROMPT = `
You are a precise nutrition extraction assistant.
Analyze the provided image.
Extract the nutritional information and return ONLY a valid JSON object.
`.trim();

function normaliseExtraction(raw) {
  const foodName = typeof raw.foodName === "string" && raw.foodName.trim() ? raw.foodName.trim().slice(0, 200) : null;
  if (!foodName) throw new AppError("AI could not determine the food name from this image", 422, "AI_EXTRACTION_FAILED");

  const quantity = Number(raw.quantity);
  const calories = Number(raw.calories);
  const proteinG = Number(raw.proteinG);
  const carbsG   = Number(raw.carbsG);
  const fatG     = Number(raw.fatG);
  const confidence = Math.min(1, Math.max(0, Number(raw.confidence ?? 0.5)));

  const validUnits = ["GRAM", "MILLILITER", "PIECE", "SERVING"];
  const quantityUnit = validUnits.includes(raw.quantityUnit) ? raw.quantityUnit : "SERVING";

  const numeric = { quantity, calories, proteinG, carbsG, fatG };
  for (const [key, val] of Object.entries(numeric)) {
    if (!Number.isFinite(val) || val < 0) {
      throw new AppError(`AI could not determine a valid value for "${key}"`, 422, "AI_EXTRACTION_FAILED");
    }
  }

  const micronutrients = Array.isArray(raw.micronutrients) ? raw.micronutrients
    .filter(m => VALID_NUTRIENT_CODES.has(m.code) && Number.isFinite(Number(m.amount)) && Number(m.amount) >= 0)
    .map(m => ({ code: m.code, amount: Number(m.amount) })) : [];

  return { foodName, quantity, quantityUnit, calories, proteinG, carbsG, fatG, aiConfidence: confidence, micronutrients };
}

export async function extractNutrition(imageData, mimeType) {
  let responseText;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ parts: [{ text: EXTRACTION_PROMPT }, { inlineData: { mimeType, data: imageData } }] }],
      config: { responseMimeType: "application/json", temperature: 0.1 }
    });
    responseText = response.text.trim();
  } catch (error) {
    console.error("[AI] Gemini request failed:", error?.message ?? error);
    throw new AppError("Failed to reach the AI service.", 502, "AI_SERVICE_ERROR");
  }
  let parsed;
  try { parsed = JSON.parse(responseText); } catch { throw new AppError("AI returned unexpected response.", 422, "AI_EXTRACTION_FAILED"); }
  return normaliseExtraction(parsed);
}

// -----------------------------------------------------------------------------
// CHAT & TOOLS CONFIGURATION
// -----------------------------------------------------------------------------

const chatTools = [{
  functionDeclarations: [
    {
      name: "create_food_entry",
      description: "Logs a food or meal into the user's diary. Use this when the user says they ate something.",
      parameters: {
        type: "OBJECT",
        properties: {
          foodName: { type: "STRING" },
          quantity: { type: "NUMBER" },
          quantityUnit: { type: "STRING", enum: ["GRAM", "MILLILITER", "PIECE", "SERVING"] },
          calories: { type: "NUMBER" },
          proteinG: { type: "NUMBER" },
          carbsG: { type: "NUMBER" },
          fatG: { type: "NUMBER" },
          mealType: { type: "STRING", enum: ["BREAKFAST", "LUNCH", "DINNER", "SNACK"] },
          eatenAt: { type: "STRING", description: "ISO 8601 date string, e.g., 2023-10-25T14:30:00Z" }
        },
        required: ["foodName", "quantity", "quantityUnit", "calories", "proteinG", "carbsG", "fatG", "mealType", "eatenAt"]
      }
    },
    {
      name: "get_food_entries",
      description: "Gets the user's logged food entries for a specific time period.",
      parameters: {
        type: "OBJECT",
        properties: {
          from: { type: "STRING", description: "Start date (YYYY-MM-DD)" },
          to: { type: "STRING", description: "End date (YYYY-MM-DD)" }
        }
      }
    },
    {
      name: "get_current_goals",
      description: "Retrieves the user's current nutritional goals (calories, protein, carbs, fat).",
      parameters: { type: "OBJECT", properties: {} }
    },
    {
      name: "set_goals",
      description: "Sets new nutritional targets. MUST ASK FOR CONFIRMATION before using.",
      parameters: {
        type: "OBJECT",
        properties: {
          calorieTarget: { type: "NUMBER" },
          proteinTarget: { type: "NUMBER" },
          carbsTarget: { type: "NUMBER" },
          fatTarget: { type: "NUMBER" }
        },
        required: ["calorieTarget", "proteinTarget", "carbsTarget", "fatTarget"]
      }
    },
    {
      name: "get_daily_summary",
      description: "Retrieves the user's total macros and calories for a specific day, compared to their goal.",
      parameters: {
        type: "OBJECT",
        properties: {
          date: { type: "STRING", description: "The date (YYYY-MM-DD)" }
        },
        required: ["date"]
      }
    }
  ]
}];

const SYSTEM_INSTRUCTION = `
You are a helpful nutrition assistant inside a calorie tracking app.
You help users log meals, check their goals, and review their progress.
When a user asks you to log a meal, you should use the 'create_food_entry' tool. If you lack information (calories, macros, meal type), make reasonable estimates based on standard nutritional data for the food, or ask the user to clarify if it's too ambiguous.
Current date/time for reference: ${new Date().toISOString()}
If they ask to change their goals, explicitly ask for confirmation before calling 'set_goals'.
Always be polite, concise, and do not use markdown code blocks for plain text.
`.trim();

async function executeToolCall(userId, call) {
  const name = call.name;
  const args = call.args;

  try {
    switch (name) {
      case "create_food_entry":
        const entry = await createFoodEntry(userId, {
          ...args,
          source: "MANUAL",
          micronutrients: []
        });
        return { success: true, message: "Food logged successfully.", data: { id: entry.id, foodName: entry.foodName } };
        
      case "get_food_entries":
        const entries = await listFoodEntries(userId, {
          page: 1, limit: 50, from: args.from, to: args.to
        });
        return { success: true, data: entries.foodEntries };
        
      case "get_current_goals":
        const goals = await listGoals(userId, { page: 1, limit: 1 });
        return { success: true, data: goals.goals[0] || null };
        
      case "set_goals":
        const newGoal = await createGoal(userId, {
          ...args,
          effectiveFrom: new Date().toISOString()
        });
        return { success: true, message: "Goals updated successfully.", data: newGoal };
        
      case "get_daily_summary":
        const summary = await getGoalComparison(userId, { date: args.date });
        return { success: true, data: summary };
        
      default:
        return { error: "Unknown tool call" };
    }
  } catch (error) {
    console.error("[AI] Tool execution failed:", error);
    return { error: error.message };
  }
}

export async function chatWithData(userId, message, history = []) {
  try {
    const formattedHistory = history.map(h => ({
      role: h.role,
      parts: h.parts
    }));

    const chat = ai.chats.create({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: chatTools,
        temperature: 0.7
      },
      history: formattedHistory
    });

    let response = await chat.sendMessage({ message });

    let loopCount = 0;
    while (response.functionCalls && response.functionCalls.length > 0 && loopCount < 5) {
      loopCount++;
      const functionResponses = [];

      for (const call of response.functionCalls) {
        const result = await executeToolCall(userId, call);
        functionResponses.push({
          functionResponse: {
            name: call.name,
            response: result
          }
        });
      }

      response = await chat.sendMessage({ message: functionResponses });
    }

    return response.text;
  } catch (error) {
    console.error("[AI] Chat request failed:", error?.message ?? error);
    throw new AppError("Failed to reach the AI service. Please try again later.", 502, "AI_SERVICE_ERROR");
  }
}
