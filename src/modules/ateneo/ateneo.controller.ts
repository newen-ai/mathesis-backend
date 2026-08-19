import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { ateneoService } from "./ateneo.service";
import type {
  AteneoCommentParams,
  AteneoGroupParams,
  AteneoTopicParams,
  CreateAteneoGroupBody,
  CreateAteneoTopicBody,
  CreateAteneoTopicCommentBody,
  ListAteneoFeedQuery,
  ListAteneoGroupMembersParams,
  ListAteneoGroupsQuery,
  ListAteneoTopicsQuery,
  UpdateAteneoGroupBody,
  ToggleAteneoTopicCommentReactionBody,
  ToggleAteneoTopicReactionBody
} from "./ateneo.schemas";

export const listAteneoGroups: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const query = req.query as ListAteneoGroupsQuery;
  const result = await ateneoService.listGroups(currentUserId, query.tab, query.limit);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "ATENEO_GROUPS_LISTED",
    data: result
  });
};

export const createAteneoGroup: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const body = req.body as CreateAteneoGroupBody;
  const result = await ateneoService.createGroup(currentUserId, body);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "ATENEO_GROUP_CREATED",
    data: result
  });
};

export const listAteneoFeed: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const query = req.query as ListAteneoFeedQuery;
  const result = await ateneoService.listFeed(currentUserId, query.limit);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "ATENEO_FEED_LISTED",
    data: result
  });
};

export const getAteneoGroup: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const params = req.params as AteneoGroupParams;
  const result = await ateneoService.getGroup(currentUserId, params);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "ATENEO_GROUP_FOUND",
    data: result
  });
};

export const listAteneoGroupMembers: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const params = req.params as ListAteneoGroupMembersParams;
  const result = await ateneoService.listGroupMembers(currentUserId, params);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "ATENEO_GROUP_MEMBERS_LISTED",
    data: result
  });
};

export const joinAteneoGroup: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const params = req.params as AteneoGroupParams;
  const result = await ateneoService.joinGroup(currentUserId, params);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "ATENEO_GROUP_JOINED",
    data: result
  });
};

export const updateAteneoGroup: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const params = req.params as AteneoGroupParams;
  const body = req.body as UpdateAteneoGroupBody;
  const result = await ateneoService.updateGroup(currentUserId, params, body);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "ATENEO_GROUP_UPDATED",
    data: result
  });
};

export const listAteneoTopics: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const params = req.params as AteneoGroupParams;
  const query = req.query as ListAteneoTopicsQuery;
  const result = await ateneoService.listGroupTopics(currentUserId, params, query.limit);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "ATENEO_TOPICS_LISTED",
    data: result
  });
};

export const createAteneoTopic: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const params = req.params as AteneoGroupParams;
  const body = req.body as CreateAteneoTopicBody;
  const result = await ateneoService.createTopic(currentUserId, params, body);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "ATENEO_TOPIC_CREATED",
    data: result
  });
};

export const getAteneoTopic: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const params = req.params as AteneoTopicParams;
  const result = await ateneoService.getTopic(currentUserId, params);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "ATENEO_TOPIC_FOUND",
    data: result
  });
};

export const listAteneoTopicComments: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const params = req.params as AteneoTopicParams;
  const result = await ateneoService.listTopicComments(currentUserId, params);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "ATENEO_TOPIC_COMMENTS_LISTED",
    data: result
  });
};

export const createAteneoTopicComment: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const params = req.params as AteneoTopicParams;
  const body = req.body as CreateAteneoTopicCommentBody;
  const result = await ateneoService.createTopicComment(currentUserId, params, body);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "ATENEO_TOPIC_COMMENT_CREATED",
    data: result
  });
};

export const toggleAteneoTopicReaction: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const params = req.params as AteneoTopicParams;
  const body = req.body as ToggleAteneoTopicReactionBody;
  const result = await ateneoService.toggleTopicReaction(currentUserId, params, body);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "ATENEO_TOPIC_REACTION_TOGGLED",
    data: result
  });
};

export const toggleAteneoTopicCommentReaction: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const params = req.params as AteneoCommentParams;
  const body = req.body as ToggleAteneoTopicCommentReactionBody;
  const result = await ateneoService.toggleCommentReaction(currentUserId, params, body);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "ATENEO_TOPIC_COMMENT_REACTION_TOGGLED",
    data: result
  });
};
