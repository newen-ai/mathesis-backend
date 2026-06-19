import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import type {
  GetProfileByUserIdParams,
  SearchUsersQuery,
  UpdateMyProfileBody,
  UpdateMyWorkExperiencesBody
} from "./profile.schemas";
import { profileService } from "./profile.service";

export const searchUsers: RequestHandler = async (req, res) => {
  const text = (req.query as SearchUsersQuery).text.trim();
  const result = await profileService.searchUsersByName(text);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "USERS_FOUND",
    data: result
  });
};

export const myProfile: RequestHandler = async (req, res) => {
  const userId = req.user?.sub;
  const result = await profileService.getMyProfile(userId as string);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "MY_PROFILE",
    data: result
  });
};

export const profileByUserId: RequestHandler = async (req, res) => {
  const userId = (req.params as GetProfileByUserIdParams).userId;
  const result = await profileService.getProfileByUserId(userId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "PROFILE_BY_USER_ID",
    data: result
  });
};

export const upsertMyProfile: RequestHandler = async (req, res) => {
  const userId = req.user?.sub;
  const result = await profileService.upsertMyProfile(userId as string, req.body as UpdateMyProfileBody);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "PROFILE_SAVED",
    data: result
  });
};

export const updateMyWorkExperiences: RequestHandler = async (req, res) => {
  const userId = req.user?.sub;
  const result = await profileService.updateMyWorkExperiences(
    userId as string,
    req.body as UpdateMyWorkExperiencesBody
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "WORK_EXPERIENCES_UPDATED",
    data: result
  });
};
