import * as foodEntryService
  from "./food-entry.service.js";
import { mapFoodEntry } from "./food-entry.mapper.js";

export async function getFoodEntryById(req, res) {
  const foodEntry = await foodEntryService.getFoodEntryById(
    req.user.id,
    req.params.id
  );

  res.status(200).json({
    data: mapFoodEntry(foodEntry)
  });
}

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

    res.status(201).json({
        data: mapFoodEntry(foodEntry)
    });
  } catch (error) {
    next(error);
  }
};

export const bulkCreate = async (req, res, next) => {
  try {
    const foodEntries = await foodEntryService.bulkCreateFoodEntries(
      req.user.id,
      req.body
    );

    res.status(201).json({
      data: foodEntries.map(mapFoodEntry)
    });
  } catch (error) {
    next(error);
  }
};

export async function list(req, res) {
  const result =
    await foodEntryService.listFoodEntries(
      req.user.id,
      req.validatedQuery
    );

  res.status(200).json({
    data: result.foodEntries.map(
      mapFoodEntry
    ),
    pagination: {
      page: result.page,
      limit: result.limit,
      totalItems: result.totalItems,
      totalPages: Math.ceil(
        result.totalItems / result.limit
      )
    }
  });
}

export async function update(req, res, next) {
  try {
    const foodEntry =
      await foodEntryService.updateFoodEntry(
        req.user.id,
        req.params.id,
        req.body
      );

    res.status(200).json({
      data: mapFoodEntry(foodEntry)
    });
  } catch (error) {
    next(error);
  }
}


export async function remove(req, res, next) {
  try {
    await foodEntryService.deleteFoodEntry(
      req.user.id,
      req.params.id
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}