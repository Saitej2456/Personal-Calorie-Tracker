import * as authService from "./auth.service.js";

export const register = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await authService.register(req.body);

    return res.status(201).json({
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await authService.login(req.body);

    return res.status(200).json({
      data: result
    });
  } catch (error) {
    next(error);
  }
};