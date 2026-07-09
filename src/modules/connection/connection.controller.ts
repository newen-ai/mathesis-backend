import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import type { ConnectionByUserIdParams } from "./connection.schemas";
import { connectionService } from "./connection.service";

export const connectToUser: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const targetUserId = (req.params as ConnectionByUserIdParams).userId;

  const result = await connectionService.connectUsers(currentUserId, targetUserId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "CONNECTION_CREATED",
    data: result
  });
};

export const disconnectFromUser: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const targetUserId = (req.params as ConnectionByUserIdParams).userId;

  const result = await connectionService.disconnectUsers(currentUserId, targetUserId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "CONNECTION_REMOVED",
    data: result
  });
};

export const myConnections: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const result = await connectionService.getMyConnections(currentUserId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "CONNECTIONS_LISTED",
    data: result
  });
};
