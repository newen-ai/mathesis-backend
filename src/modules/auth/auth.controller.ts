import type { CookieOptions, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { env } from "../../config/env";
import { authService } from "./auth.service";
import type { ConfirmEmailBody, LoginBody, RegisterBody } from "./auth.schemas";

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
    message: "USER_REGISTERED",
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
    message: "LOGIN_SUCCESSFUL",
    data: {
      user: result.user
    }
  });
};

export const confirmEmail: RequestHandler = async (req, res) => {
  const result = await authService.confirmEmail(req.body as ConfirmEmailBody);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "EMAIL_CONFIRMED",
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
    message: "LOGOUT_SUCCESSFUL"
  });
};
