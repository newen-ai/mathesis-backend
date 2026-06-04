import type { CookieOptions, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { env } from "../../config/env";
import { authService } from "./auth.service";
import type { LoginBody, RegisterBody, UpdateMyProfileBody } from "./auth.schemas";

function buildAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.AUTH_COOKIE_SECURE,
    sameSite: env.AUTH_COOKIE_SAME_SITE,
    path: "/"
  };
}

export const register: RequestHandler = async (req, res) => {
  const result = await authService.register(req.body as RegisterBody);
  const cookieOptions = buildAuthCookieOptions();

  res.cookie(env.AUTH_COOKIE_NAME, result.accessToken, cookieOptions);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "User registered",
    data: {
      user: result.user
    }
  });
};

export const login: RequestHandler = async (req, res) => {
  const result = await authService.login(req.body as LoginBody);
  const cookieOptions = buildAuthCookieOptions();

  res.cookie(env.AUTH_COOKIE_NAME, result.accessToken, cookieOptions);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Login successful",
    data: {
      user: result.user
    }
  });
};

export const logout: RequestHandler = async (_req, res) => {
  res.clearCookie(env.AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.AUTH_COOKIE_SECURE,
    sameSite: env.AUTH_COOKIE_SAME_SITE,
    path: "/"
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Logout successful"
  });
};

export const me: RequestHandler = async (req, res) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Authenticated user",
    data: req.user
  });
};

export const myProfile: RequestHandler = async (req, res) => {
  const userId = req.user?.sub;
  const result = await authService.getMyProfile(userId as string);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "My profile",
    data: result
  });
};

export const upsertMyProfile: RequestHandler = async (req, res) => {
  const userId = req.user?.sub;
  const result = await authService.upsertMyProfile(userId as string, req.body as UpdateMyProfileBody);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Profile saved",
    data: result
  });
};
