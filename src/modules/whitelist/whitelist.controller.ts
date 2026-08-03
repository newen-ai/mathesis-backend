import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import type {
  ApproveWhitelistRequestBody,
  ApproveWhitelistRequestParams,
  ListUsersByWhitelistStateQuery,
  ListWhitelistRequestsQuery,
  ListWhitelistedEmailsQuery,
  PromoteUserToWhitelistBody,
  PromoteUserToWhitelistParams
} from "./whitelist.schemas";
import { whitelistService } from "./whitelist.service";

export const listWhitelistedEmails: RequestHandler = async (req, res) => {
  const query = req.query as unknown as ListWhitelistedEmailsQuery;
  const rows = await whitelistService.listWhitelistedEmails(query.limit, query.offset);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "WHITELISTED_EMAILS_LISTED",
    data: {
      items: rows
    }
  });
};

export const listUsersByWhitelistState: RequestHandler = async (req, res) => {
  const query = req.query as unknown as ListUsersByWhitelistStateQuery;
  const rows = await whitelistService.listUsersByWhitelistState(
    query.status === "whitelisted",
    query.limit,
    query.offset
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "USERS_LISTED_BY_WHITELIST_STATE",
    data: {
      items: rows,
      status: query.status
    }
  });
};

export const promoteUserToWhitelist: RequestHandler = async (req, res) => {
  const params = req.params as PromoteUserToWhitelistParams;
  const body = req.body as PromoteUserToWhitelistBody;
  const actorUserId = req.user?.sub as string;

  const promoted = await whitelistService.promoteUserToWhitelist(params.userId, actorUserId, body.reason);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "USER_PROMOTED_TO_WHITELIST",
    data: {
      user: promoted
    }
  });
};

export const listWhitelistRequests: RequestHandler = async (req, res) => {
  const query = req.query as unknown as ListWhitelistRequestsQuery;
  const rows = await whitelistService.listWhitelistRequests(query.status, query.limit, query.offset);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "WHITELIST_REQUESTS_LISTED",
    data: {
      items: rows
    }
  });
};

export const approveWhitelistRequest: RequestHandler = async (req, res) => {
  const params = req.params as ApproveWhitelistRequestParams;
  const body = req.body as ApproveWhitelistRequestBody;
  const actorUserId = req.user?.sub as string;
  const result = await whitelistService.approveWhitelistRequest(params.requestId, actorUserId, body.reason);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "WHITELIST_REQUEST_APPROVED",
    data: {
      request: result
    }
  });
};
