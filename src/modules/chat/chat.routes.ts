import { Router } from "express";
import { asyncHandler } from "../../common/errors/async-handler";
import { requireAuth } from "../../common/middlewares/require-auth";
import { validateRequest } from "../../common/middlewares/validate-request";
import {
  addGroupMembers,
  chatDetailById,
  createDirectChat,
  createGroupChat,
  deleteMessage,
  editMessage,
  exitGroup,
  listMyChats,
  markChatAsRead,
  promoteGroupAdmin,
  readMessages,
  sendMessage,
  transferGroupAdmin,
  updateGroupConfig
} from "./chat.controller";
import {
  addGroupMembersSchema,
  chatByIdSchema,
  createDirectChatSchema,
  createGroupChatSchema,
  deleteMessageSchema,
  exitGroupSchema,
  listMyChatsSchema,
  markChatAsReadSchema,
  promoteGroupAdminSchema,
  readMessagesSchema,
  sendMessageSchema,
  transferGroupAdminSchema,
  updateGroupConfigSchema,
  updateMessageSchema
} from "./chat.schemas";

const chatRouter = Router();

chatRouter.get("/", requireAuth(), validateRequest(listMyChatsSchema), asyncHandler(listMyChats));
chatRouter.post("/direct", requireAuth(), validateRequest(createDirectChatSchema), asyncHandler(createDirectChat));
chatRouter.post("/groups", requireAuth(), validateRequest(createGroupChatSchema), asyncHandler(createGroupChat));
chatRouter.get("/:chatId", requireAuth(), validateRequest(chatByIdSchema), asyncHandler(chatDetailById));
chatRouter.post("/:chatId/members", requireAuth(), validateRequest(addGroupMembersSchema), asyncHandler(addGroupMembers));
chatRouter.post("/:chatId/messages", requireAuth(), validateRequest(sendMessageSchema), asyncHandler(sendMessage));
chatRouter.get("/:chatId/messages", requireAuth(), validateRequest(readMessagesSchema), asyncHandler(readMessages));
chatRouter.post("/:chatId/read", requireAuth(), validateRequest(markChatAsReadSchema), asyncHandler(markChatAsRead));
chatRouter.patch("/:chatId/messages/:messageId", requireAuth(), validateRequest(updateMessageSchema), asyncHandler(editMessage));
chatRouter.delete("/:chatId/messages/:messageId", requireAuth(), validateRequest(deleteMessageSchema), asyncHandler(deleteMessage));
chatRouter.post("/:chatId/leave", requireAuth(), validateRequest(exitGroupSchema), asyncHandler(exitGroup));
chatRouter.patch("/:chatId", requireAuth(), validateRequest(updateGroupConfigSchema), asyncHandler(updateGroupConfig));
chatRouter.post("/:chatId/admins/promote", requireAuth(), validateRequest(promoteGroupAdminSchema), asyncHandler(promoteGroupAdmin));
chatRouter.post("/:chatId/admins/transfer", requireAuth(), validateRequest(transferGroupAdminSchema), asyncHandler(transferGroupAdmin));

export { chatRouter };
