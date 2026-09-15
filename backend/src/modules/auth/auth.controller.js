import * as authService from "./auth.service.js";
import { AppError } from "../../utils/app-error.js";

const REFRESH_TOKEN_COOKIE = "refresh_token";

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/v1/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const setRefreshTokenCookie = (
  res,
  refreshToken
) => {
  res.cookie(
    REFRESH_TOKEN_COOKIE,
    refreshToken,
    refreshTokenCookieOptions
  );
};

export const register = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await authService.register(req.body);

    setRefreshTokenCookie(
      res,
      result.refreshToken
    );

    const {
      refreshToken,
      ...responseData
    } = result;

    return res.status(201).json({
      data: responseData
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

    setRefreshTokenCookie(
      res,
      result.refreshToken
    );

    const {
      refreshToken,
      ...responseData
    } = result;

    return res.status(200).json({
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req,
  res,
  next
) => {
  try {
    const refreshToken =
      req.cookies.refresh_token;

    if (!refreshToken) {
      throw new AppError(
        "Refresh token missing",
        401,
        "UNAUTHENTICATED"
      );
    }

    const result =
      await authService.refresh(
        refreshToken
      );

    setRefreshTokenCookie(
      res,
      result.refreshToken
    );

    return res.status(200).json({
      data: {
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req,
  res,
  next
) => {
  try {
    const refreshToken =
      req.cookies.refresh_token;

    await authService.logout(
      refreshToken
    );

    res.clearCookie(
      REFRESH_TOKEN_COOKIE,
      refreshTokenCookieOptions
    );

    return res.status(200).json({
      data: {
        message: "Logged out successfully"
      }
    });
  } catch (error) {
    next(error);
  }
};