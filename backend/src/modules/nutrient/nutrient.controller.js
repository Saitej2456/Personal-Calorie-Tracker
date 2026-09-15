import * as nutrientService
  from "./nutrient.service.js";

export const listNutrients = async (
  req,
  res,
  next
) => {
  try {
    const nutrients =
      await nutrientService.listNutrients();

    return res.status(200).json({
      data: nutrients
    });
  } catch (error) {
    next(error);
  }
};