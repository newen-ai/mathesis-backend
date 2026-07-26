import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../../common/errors/async-handler";
import { requireAuth } from "../../common/middlewares/require-auth";
import { validateRequest } from "../../common/middlewares/validate-request";
import { createFeedPost, deleteFeedPost, downloadFeedAttachment, listFeedPosts } from "./feed.controller";
import {
  createFeedPostSchema,
  deleteFeedPostSchema,
  downloadFeedAttachmentSchema,
  listFeedPostsSchema
} from "./feed.schemas";

const feedUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5
  }
});

const feedRouter = Router();

feedRouter.get("/", requireAuth(), validateRequest(listFeedPostsSchema), asyncHandler(listFeedPosts));
feedRouter.post(
  "/",
  requireAuth(),
  feedUpload.array("pdfFiles", 5),
  validateRequest(createFeedPostSchema),
  asyncHandler(createFeedPost)
);
feedRouter.get(
  "/:postId/attachments/:attachmentId",
  requireAuth(),
  validateRequest(downloadFeedAttachmentSchema),
  asyncHandler(downloadFeedAttachment)
);
feedRouter.delete("/:postId", requireAuth(), validateRequest(deleteFeedPostSchema), asyncHandler(deleteFeedPost));

export { feedRouter };