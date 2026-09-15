import { Router } from "express";

import * as nutrientController
  from "./nutrient.controller.js";

const router = Router();

router.get(
  "/",
  nutrientController.listNutrients
);

export default router;