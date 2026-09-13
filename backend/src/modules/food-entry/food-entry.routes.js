import { Router } from "express";

import {
  requireAuth
} from "../../middleware/auth.middleware.js";

import {
  validateBody
} from "../../middleware/validate.middleware.js";

import * as controller
  from "./food-entry.controller.js";

import {
  createFoodEntrySchema
} from "./food-entry.schema.js";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  validateBody(createFoodEntrySchema),
  controller.create
);

export default router;