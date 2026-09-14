import * as reportService from "./report.service.js";

export async function calories(req, res, next) {
  try {
    const report = await reportService.getCalorieReport(
      req.user.id,
      req.validatedQuery
    );

    return res.status(200).json({
      data: report
    });
  } catch (error) {
    next(error);
  }
}

export async function macros(req, res, next) {
  try {
    const report =
      await reportService.getMacroReport(
        req.user.id,
        req.validatedQuery
      );

    return res.status(200).json({
      data: report
    });
  } catch (error) {
    next(error);
  }
}

export async function micronutrients(
  req,
  res,
  next
) {
  try {
    const report =
      await reportService.getMicronutrientReport(
        req.user.id,
        req.validatedQuery
      );

    return res.status(200).json({
      data: report
    });
  } catch (error) {
    next(error);
  }
}

export async function goalComparison(req, res, next) {
  try {
    const report =
      await reportService.getGoalComparison(
        req.user.id,
        req.validatedQuery
      );

    return res.status(200).json({
      data: report
    });
  } catch (error) {
    next(error);
  }
}