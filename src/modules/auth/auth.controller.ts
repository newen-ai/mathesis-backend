import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { authService } from "./auth.service";
import type { LoginBody, RegisterBody, UpdateMyProfileBody } from "./auth.schemas";

export const register: RequestHandler = async (req, res) => {
  const result = await authService.register(req.body as RegisterBody);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "User registered",
    data: result
  });
};

export const login: RequestHandler = async (req, res) => {
  const result = await authService.login(req.body as LoginBody);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Login successful",
    data: result
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
