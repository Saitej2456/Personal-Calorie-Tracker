import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import { extractNutritionSchema, chatRequestSchema } from "./ai.schema.js";
import { extractNutritionController, chatController } from "./ai.controller.js";

const router = Router();

/*
 * All AI endpoints require authentication — we don't want
 * unauthenticated callers hitting the Gemini API on our key.
 */
router.use(requireAuth);

router.post(
  "/extract-nutrition",
  validateBody(extractNutritionSchema),
  extractNutritionController
);

router.post(
  "/chat",
  validateBody(chatRequestSchema),
  chatController
);

export default router;
