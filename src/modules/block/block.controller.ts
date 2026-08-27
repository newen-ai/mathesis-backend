import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import type { BlockByUserIdBody, BlockByUserIdParams, UnblockByUserIdParams } from "./block.schemas";
import { blockService } from "./block.service";

export const blockUser: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const targetUserId = (req.params as BlockByUserIdParams).targetUserId;
  const body = req.body as BlockByUserIdBody;

  const result = await blockService.blockUser(currentUserId, targetUserId, body.reasonNote ?? null);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "USER_BLOCKED",
    data: result
  });
};

export const unblockUser: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const targetUserId = (req.params as UnblockByUserIdParams).targetUserId;

  const result = await blockService.unblockUser(currentUserId, targetUserId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "USER_UNBLOCKED",
    data: result
  });
};

export const listMyBlockedUsers: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;

  const result = await blockService.listMyBlockedUsers(currentUserId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "BLOCKED_USERS_LISTED",
    data: result
  });
};
