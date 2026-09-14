import * as weightLogService from "./weight-log.service.js";
import { mapWeightLog } from "./weight-log.mapper.js";
import { AppError } from "../../utils/app-error.js";

export async function create(req, res, next) {
  try {
    const weightLog = await weightLogService.createWeightLog(
      req.user.id,
      req.body
    );

    return res.status(201).json({
      data: mapWeightLog(weightLog)
    });
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    const { page, limit, from, to } = req.validatedQuery;

    const {
      weightLogs,
      totalItems
    } = await weightLogService.listWeightLogs(
      req.user.id,
      {
        page,
        limit,
        from,
        to
      }
    );

    return res.status(200).json({
      data: weightLogs.map(mapWeightLog),
      pagination: {
        page,
        limit,
        total: totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const weightLog =
      await weightLogService.getWeightLogById(
        req.user.id,
        req.params.id
      );

    if (!weightLog) {
      throw new AppError(
        "Weight log not found",
        404,
        "RESOURCE_NOT_FOUND"
      );
    }

    return res.status(200).json({
      data: mapWeightLog(weightLog)
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const weightLog =
      await weightLogService.updateWeightLog(
        req.user.id,
        req.params.id,
        req.body
      );

    if (!weightLog) {
      throw new AppError(
        "Weight log not found",
        404,
        "RESOURCE_NOT_FOUND"
      );
    }

    return res.status(200).json({
      data: mapWeightLog(weightLog)
    });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const deleted =
      await weightLogService.deleteWeightLog(
        req.user.id,
        req.params.id
      );

    if (!deleted) {
      throw new AppError(
        "Weight log not found",
        404,
        "RESOURCE_NOT_FOUND"
      );
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}