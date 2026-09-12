import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../../common/errors/async-handler";
import { requireAuth } from "../../common/middlewares/require-auth";
import { validateRequest } from "../../common/middlewares/validate-request";
import {
  createAteneoGroup,
  createAteneoTopic,
  createAteneoTopicComment,
  deleteAteneoTopic,
  downloadAteneoTopicAttachment,
  getAteneoGroup,
  getRemovedAteneoTopicPreview,
  getAteneoTopic,
  joinAteneoGroup,
  kickAteneoGroupMember,
  listAteneoGroupExpulsions,
  listAteneoRemovedContent,
  listAteneoGroupMembers,
  listAteneoFeed,
  listAteneoGroups,
  listAteneoTopicComments,
  listAteneoTopics,
  moderateRemoveAteneoTopic,
  moderateRemoveAteneoTopicComment,
  moderateRestoreAteneoTopic,
  moderateRestoreAteneoTopicComment,
  restoreAteneoGroupMember,
  updateAteneoGroup,
  toggleAteneoTopicCommentReaction,
  toggleAteneoTopicReaction
} from "./ateneo.controller";
import {
  createAteneoGroupSchema,
  createAteneoTopicCommentSchema,
  createAteneoTopicSchema,
  deleteAteneoTopicSchema,
  getAteneoGroupSchema,
  getRemovedAteneoTopicPreviewSchema,
  getAteneoTopicSchema,
  joinAteneoGroupSchema,
  kickAteneoGroupMemberSchema,
  listAteneoFeedSchema,
  listAteneoGroupExpulsionsSchema,
  listAteneoRemovedContentSchema,
  listAteneoGroupMembersSchema,
  listAteneoGroupsSchema,
  listAteneoTopicCommentsSchema,
  listAteneoTopicsSchema,
  moderateRemoveAteneoTopicCommentSchema,
  moderateRemoveAteneoTopicSchema,
  moderateRestoreAteneoTopicCommentSchema,
  moderateRestoreAteneoTopicSchema,
  restoreAteneoGroupMemberSchema,
  downloadAteneoTopicAttachmentSchema,
  updateAteneoGroupSchema,
  toggleAteneoTopicCommentReactionSchema,
  toggleAteneoTopicReactionSchema
} from "./ateneo.schemas";

const ateneoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5
  }
});

const ateneoRouter = Router();

ateneoRouter.get("/groups", requireAuth(), validateRequest(listAteneoGroupsSchema), asyncHandler(listAteneoGroups));
ateneoRouter.post("/groups", requireAuth(), validateRequest(createAteneoGroupSchema), asyncHandler(createAteneoGroup));
ateneoRouter.get("/feed", requireAuth(), validateRequest(listAteneoFeedSchema), asyncHandler(listAteneoFeed));
ateneoRouter.get("/groups/:groupId", requireAuth(), validateRequest(getAteneoGroupSchema), asyncHandler(getAteneoGroup));
ateneoRouter.get(
  "/groups/:groupId/members",
  requireAuth(),
  validateRequest(listAteneoGroupMembersSchema),
  asyncHandler(listAteneoGroupMembers)
);
ateneoRouter.get(
  "/groups/:groupId/expulsions",
  requireAuth(),
  validateRequest(listAteneoGroupExpulsionsSchema),
  asyncHandler(listAteneoGroupExpulsions)
);
ateneoRouter.get(
  "/groups/:groupId/moderation/removed-content",
  requireAuth(),
  validateRequest(listAteneoRemovedContentSchema),
  asyncHandler(listAteneoRemovedContent)
);
ateneoRouter.post(
  "/groups/:groupId/members/:targetUserId/kick",
  requireAuth(),
  validateRequest(kickAteneoGroupMemberSchema),
  asyncHandler(kickAteneoGroupMember)
);
ateneoRouter.post(
  "/groups/:groupId/members/:targetUserId/restore",
  requireAuth(),
  validateRequest(restoreAteneoGroupMemberSchema),
  asyncHandler(restoreAteneoGroupMember)
);
ateneoRouter.post("/groups/:groupId/join", requireAuth(), validateRequest(joinAteneoGroupSchema), asyncHandler(joinAteneoGroup));
ateneoRouter.patch(
  "/groups/:groupId",
  requireAuth(),
  validateRequest(updateAteneoGroupSchema),
  asyncHandler(updateAteneoGroup)
);
ateneoRouter.get("/groups/:groupId/topics", requireAuth(), validateRequest(listAteneoTopicsSchema), asyncHandler(listAteneoTopics));
ateneoRouter.post(
  "/groups/:groupId/topics",
  requireAuth(),
  ateneoUpload.array("attachments", 5),
  validateRequest(createAteneoTopicSchema),
  asyncHandler(createAteneoTopic)
);
ateneoRouter.get("/groups/:groupId/topics/:topicId", requireAuth(), validateRequest(getAteneoTopicSchema), asyncHandler(getAteneoTopic));
ateneoRouter.get(
  "/groups/:groupId/topics/:topicId/moderation/preview",
  requireAuth(),
  validateRequest(getRemovedAteneoTopicPreviewSchema),
  asyncHandler(getRemovedAteneoTopicPreview)
);
ateneoRouter.delete(
  "/groups/:groupId/topics/:topicId",
  requireAuth(),
  validateRequest(deleteAteneoTopicSchema),
  asyncHandler(deleteAteneoTopic)
);
ateneoRouter.post(
  "/groups/:groupId/topics/:topicId/moderation/remove",
  requireAuth(),
  validateRequest(moderateRemoveAteneoTopicSchema),
  asyncHandler(moderateRemoveAteneoTopic)
);
ateneoRouter.post(
  "/groups/:groupId/topics/:topicId/moderation/restore",
  requireAuth(),
  validateRequest(moderateRestoreAteneoTopicSchema),
  asyncHandler(moderateRestoreAteneoTopic)
);
ateneoRouter.get(
  "/groups/:groupId/topics/:topicId/attachments/:attachmentId",
  requireAuth(),
  validateRequest(downloadAteneoTopicAttachmentSchema),
  asyncHandler(downloadAteneoTopicAttachment)
);
ateneoRouter.get(
  "/groups/:groupId/topics/:topicId/comments",
  requireAuth(),
  validateRequest(listAteneoTopicCommentsSchema),
  asyncHandler(listAteneoTopicComments)
);
ateneoRouter.post(
  "/groups/:groupId/topics/:topicId/comments",
  requireAuth(),
  validateRequest(createAteneoTopicCommentSchema),
  asyncHandler(createAteneoTopicComment)
);
ateneoRouter.post(
  "/groups/:groupId/topics/:topicId/comments/:commentId/moderation/remove",
  requireAuth(),
  validateRequest(moderateRemoveAteneoTopicCommentSchema),
  asyncHandler(moderateRemoveAteneoTopicComment)
);
ateneoRouter.post(
  "/groups/:groupId/topics/:topicId/comments/:commentId/moderation/restore",
  requireAuth(),
  validateRequest(moderateRestoreAteneoTopicCommentSchema),
  asyncHandler(moderateRestoreAteneoTopicComment)
);
ateneoRouter.post(
  "/groups/:groupId/topics/:topicId/reactions",
  requireAuth(),
  validateRequest(toggleAteneoTopicReactionSchema),
  asyncHandler(toggleAteneoTopicReaction)
);
ateneoRouter.post(
  "/groups/:groupId/topics/:topicId/comments/:commentId/reactions",
  requireAuth(),
  validateRequest(toggleAteneoTopicCommentReactionSchema),
  asyncHandler(toggleAteneoTopicCommentReaction)
);

export { ateneoRouter };
