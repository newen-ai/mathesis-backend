import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { AppError } from "../../common/errors/app-error";
import type {
  AddGroupMembersBody,
  ChatByIdParams,
  CreateDirectChatBody,
  CreateGroupChatBody,
  GroupAdminBody,
  MessageByIdParams,
  ReadMessagesQuery,
  SendMessageBody,
  UpdateGroupConfigBody,
  UpdateMessageBody
} from "./chat.schemas";
import { chatService } from "./chat.service";

const listChatsLimitSchema = z.coerce.number().int().min(1).max(100);

export const listMyChats: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const rawLimit = req.query.limit;
  let limit: number | undefined;

  if (rawLimit !== undefined) {
    const parsedLimit = listChatsLimitSchema.safeParse(rawLimit);

    if (!parsedLimit.success) {
      throw new AppError("Validation failed", StatusCodes.BAD_REQUEST, true, parsedLimit.error.issues);
    }

    limit = parsedLimit.data;
  }

  const result = await chatService.listMyChats(currentUserId, limit);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "CHATS_LISTED",
    data: result
  });
};

export const chatDetailById: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const chatId = (req.params as ChatByIdParams).chatId;
  const result = await chatService.getChatById(currentUserId, chatId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "CHAT_DETAILS",
    data: result
  });
};

export const createDirectChat: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const targetUserId = (req.body as CreateDirectChatBody).targetUserId;
  const result = await chatService.createDirectChat(currentUserId, targetUserId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "DIRECT_CHAT_CREATED",
    data: result
  });
};

export const createGroupChat: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const body = req.body as CreateGroupChatBody;
  const result = await chatService.createGroupChat(currentUserId, body.title, body.userIds);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "GROUP_CHAT_CREATED",
    data: result
  });
};

export const addGroupMembers: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const chatId = (req.params as ChatByIdParams).chatId;
  const body = req.body as AddGroupMembersBody;
  const result = await chatService.addGroupMembers(currentUserId, chatId, body.userIds);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "GROUP_MEMBERS_ADDED",
    data: result
  });
};

export const sendMessage: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const chatId = (req.params as ChatByIdParams).chatId;
  const content = (req.body as SendMessageBody).content;
  const result = await chatService.sendMessage(currentUserId, chatId, content);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "MESSAGE_SENT",
    data: result
  });
};

export const readMessages: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const chatId = (req.params as ChatByIdParams).chatId;
  const query = req.query as ReadMessagesQuery;
  const rawLimit = req.query.limit;
  let limit: number | undefined;

  if (rawLimit !== undefined) {
    const parsedLimit = listChatsLimitSchema.safeParse(rawLimit);

    if (!parsedLimit.success) {
      throw new AppError("Validation failed", StatusCodes.BAD_REQUEST, true, parsedLimit.error.issues);
    }

    limit = parsedLimit.data;
  }

  const result = await chatService.readMessages(currentUserId, chatId, limit, query.cursor);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "MESSAGES_READ",
    data: result
  });
};

export const markChatAsRead: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const chatId = (req.params as ChatByIdParams).chatId;
  const result = await chatService.markChatAsRead(currentUserId, chatId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "CHAT_MARKED_AS_READ",
    data: result
  });
};

export const editMessage: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const params = req.params as MessageByIdParams;
  const content = (req.body as UpdateMessageBody).content;
  const result = await chatService.editMessage(currentUserId, params.chatId, params.messageId, content);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "MESSAGE_UPDATED",
    data: result
  });
};

export const deleteMessage: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const params = req.params as MessageByIdParams;
  const result = await chatService.deleteMessage(currentUserId, params.chatId, params.messageId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "MESSAGE_DELETED",
    data: result
  });
};

export const exitGroup: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const chatId = (req.params as ChatByIdParams).chatId;
  const result = await chatService.exitGroup(currentUserId, chatId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "GROUP_EXITED",
    data: result
  });
};

export const updateGroupConfig: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const chatId = (req.params as ChatByIdParams).chatId;
  const body = req.body as UpdateGroupConfigBody;
  const result = await chatService.updateGroupConfig(currentUserId, chatId, body.title);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "GROUP_CONFIG_UPDATED",
    data: result
  });
};

export const promoteGroupAdmin: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const chatId = (req.params as ChatByIdParams).chatId;
  const targetUserId = (req.body as GroupAdminBody).userId;
  const result = await chatService.promoteGroupAdmin(currentUserId, chatId, targetUserId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "GROUP_ADMIN_PROMOTED",
    data: result
  });
};

export const transferGroupAdmin: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const chatId = (req.params as ChatByIdParams).chatId;
  const targetUserId = (req.body as GroupAdminBody).userId;
  const result = await chatService.transferGroupAdmin(currentUserId, chatId, targetUserId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "GROUP_ADMIN_TRANSFERRED",
    data: result
  });
};
