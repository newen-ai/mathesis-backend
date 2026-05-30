import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { authService } from "./auth.service";

export const register: RequestHandler = async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await authService.register(email, password);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "User registered",
    data: result
  });
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await authService.login(email, password);

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
