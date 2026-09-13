import * as foodEntryService
  from "./food-entry.service.js";

export const create = async (
  req,
  res,
  next
) => {
  try {
    const foodEntry =
      await foodEntryService.createFoodEntry(
        req.user.id,
        req.body
      );

    return res.status(201).json({
      data: foodEntry
    });
  } catch (error) {
    next(error);
  }
};