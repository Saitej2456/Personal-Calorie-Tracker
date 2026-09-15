import { Router } from "express";

import {
  requireAuth
} from "../../middleware/auth.middleware.js";

import {
  validateBody,
  validateParams,
  validateQuery
} from "../../middleware/validate.middleware.js";

import * as controller
  from "./food-entry.controller.js";

import {
  createFoodEntrySchema,
  foodEntryIdSchema,
  listFoodEntriesSchema,
  updateFoodEntrySchema,
  bulkCreateFoodEntriesSchema
} from "./food-entry.schema.js";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  validateBody(createFoodEntrySchema),
  controller.create
);

router.post(
  "/bulk",
  validateBody(bulkCreateFoodEntriesSchema),
  controller.bulkCreate
);

router.get(
  "/",
  validateQuery(listFoodEntriesSchema),
  controller.list
);

router.delete(
  "/:id",
  validateParams(foodEntryIdSchema),
  controller.remove
);

router.patch(
  "/:id",
  validateParams(foodEntryIdSchema),
  validateBody(updateFoodEntrySchema),
  controller.update
);

router.get(
  "/:id",
  validateParams(foodEntryIdSchema),
  controller.getFoodEntryById
);

export default router;