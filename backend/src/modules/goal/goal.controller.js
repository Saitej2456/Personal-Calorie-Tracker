import * as goalService from "./goal.service.js";
import { mapGoal } from "./goal.mapper.js";
import { AppError } from "../../utils/app-error.js";

export async function list(req, res, next) {
  try {
    const { page, limit } = req.validatedQuery;

    const { goals, total } =
      await goalService.listGoals(req.user.id, {
        page,
        limit
      });

    return res.status(200).json({
      data: goals.map(mapGoal),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const goal =
      await goalService.createGoal(
        req.user.id,
        req.body
      );

    return res.status(201).json({
      data: mapGoal(goal)
    });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const goal =
      await goalService.getGoalById(
        req.user.id,
        req.params.id
      );

    if (!goal) {
      throw new AppError(
        "Goal not found",
        404,
        "RESOURCE_NOT_FOUND"
      );
    }

    return res.status(200).json({
      data: mapGoal(goal)
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const goal = await goalService.updateGoal(
      req.user.id,
      req.params.id,
      req.body
    );

    if (!goal) {
      throw new AppError(
        "Goal not found",
        404,
        "RESOURCE_NOT_FOUND"
      );
    }

    return res.status(200).json({
      data: mapGoal(goal)
    });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const deleted =
      await goalService.deleteGoal(
        req.user.id,
        req.params.id
      );

    if (!deleted) {
      throw new AppError(
        "Goal not found",
        404,
        "RESOURCE_NOT_FOUND"
      );
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}