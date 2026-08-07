import type { CookieOptions, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { env } from "../../config/env";
import { authService } from "./auth.service";
import type { LoginBody, RegisterBody } from "./auth.schemas";
import type { CreateWhitelistRequestBody } from "../whitelist/whitelist.schemas";

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

export const confirmEmail: RequestHandler = async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const result = await authService.confirmEmail(token);

  res.status(StatusCodes.OK).json({
    success: true,
    message: result.message,
    data: {
      confirmed: true
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

export const session: RequestHandler = async (req, res) => {
  const userId = req.user?.sub as string;
  const result = await authService.getSession(userId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "SESSION_ACTIVE",
    data: result
  });
};

export const requestWhitelistAccess: RequestHandler = async (req, res) => {
  const userId = req.user?.sub as string;
  const body = req.body as CreateWhitelistRequestBody;
  const result = await authService.createWhitelistRequest(userId, body.message);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "WHITELIST_REQUEST_SUBMITTED",
    data: result
  });
};
