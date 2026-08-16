import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import type {
  ApproveBadgeRequestParams,
  CreateMyBadgeRequestBody,
  ListAdminsQuery,
  ListBadgeRequestsQuery,
  ListMembersQuery,
  RejectBadgeRequestParams,
  RemoveAdminParams,
  RemoveMemberParams,
  SearchEligibleAdminsQuery,
  SetAdminParams
} from "./companies.schemas";
import { companiesService } from "./companies.service";

export const getMembershipState: RequestHandler = async (req, res) => {
  const userId = req.user?.sub as string;
  const membership = await companiesService.getMembershipState(userId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "COMPANIES_MEMBERSHIP_STATE_FETCHED",
    data: membership
  });
};

export const createMyBadgeRequest: RequestHandler = async (req, res) => {
  const userId = req.user?.sub as string;
  const body = (req.body ?? {}) as CreateMyBadgeRequestBody;

  await companiesService.createMyBadgeRequest(userId, body?.message);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "COMPANIES_BADGE_REQUEST_CREATED"
  });
};

export const cancelMyBadgeRequest: RequestHandler = async (req, res) => {
  const userId = req.user?.sub as string;
  await companiesService.cancelMyBadgeRequest(userId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "COMPANIES_BADGE_REQUEST_CANCELED"
  });
};

export const listBadgeRequests: RequestHandler = async (req, res) => {
  const query = req.query as unknown as ListBadgeRequestsQuery;
  const items = await companiesService.listBadgeRequests(query.status, query.limit, query.offset);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "BADGE_REQUESTS_LISTED",
    data: { items }
  });
};

export const approveBadgeRequest: RequestHandler = async (req, res) => {
  const params = req.params as ApproveBadgeRequestParams;
  const actorUserId = req.user?.sub as string;
  await companiesService.approveBadgeRequest(params.requestId, actorUserId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "BADGE_REQUEST_APPROVED"
  });
};

export const rejectBadgeRequest: RequestHandler = async (req, res) => {
  const params = req.params as RejectBadgeRequestParams;
  const actorUserId = req.user?.sub as string;
  await companiesService.rejectBadgeRequest(params.requestId, actorUserId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "BADGE_REQUEST_REJECTED"
  });
};

export const listMembers: RequestHandler = async (req, res) => {
  const query = req.query as unknown as ListMembersQuery;
  const items = await companiesService.listMembers(query.limit, query.offset);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "COMPANIES_MEMBERS_LISTED",
    data: { items }
  });
};

export const removeMember: RequestHandler = async (req, res) => {
  const params = req.params as RemoveMemberParams;
  await companiesService.removeMember(params.userId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "COMPANIES_MEMBER_REMOVED"
  });
};

export const listAdmins: RequestHandler = async (req, res) => {
  const query = req.query as unknown as ListAdminsQuery;
  const items = await companiesService.listAdmins(query.limit, query.offset);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "COMPANIES_ADMINS_LISTED",
    data: { items }
  });
};

export const searchEligibleAdmins: RequestHandler = async (req, res) => {
  const query = req.query as unknown as SearchEligibleAdminsQuery;
  const items = await companiesService.searchEligibleAdmins(query.q, query.limit);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "ELIGIBLE_ADMINS_SEARCHED",
    data: { items }
  });
};

export const setAdmin: RequestHandler = async (req, res) => {
  const params = req.params as SetAdminParams;
  await companiesService.setAdmin(params.userId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "COMPANIES_ADMIN_SET"
  });
};

export const removeAdmin: RequestHandler = async (req, res) => {
  const params = req.params as RemoveAdminParams;
  await companiesService.removeAdmin(params.userId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "COMPANIES_ADMIN_REMOVED"
  });
};
