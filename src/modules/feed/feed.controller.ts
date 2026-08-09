import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import type {
  CreateFeedPostBody,
  DeleteFeedPostParams,
  DownloadFeedAttachmentParams,
  ToggleFeedPostReactionBody,
  ToggleFeedPostReactionParams,
  ListFeedPostsQuery
} from "./feed.schemas";
import { feedService } from "./feed.service";

type UploadedPdfFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

function getUploadedPdfFiles(files: UploadedPdfFile[] | undefined): UploadedPdfFile[] {
  return files ?? [];
}

function buildAttachmentDisposition(fileName: string): string {
  const safeAsciiFileName = fileName.replace(/[\r\n"]/g, "_") || "attachment.pdf";
  const encodedFileName = encodeURIComponent(fileName || "attachment.pdf");

  return `attachment; filename="${safeAsciiFileName}"; filename*=UTF-8''${encodedFileName}`;
}

export const createFeedPost: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const body = req.body as CreateFeedPostBody;
  const files = getUploadedPdfFiles(req.files as UploadedPdfFile[] | undefined);
  const result = await feedService.createPost(currentUserId, body, files);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "FEED_POST_CREATED",
    data: result
  });
};

export const listFeedPosts: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const query = req.query as ListFeedPostsQuery;
  const result = await feedService.listFeedPosts(currentUserId, query.limit, query.sortBy, query.gravity);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "FEED_POSTS_LISTED",
    data: result
  });
};

export const toggleFeedPostReaction: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const { postId } = req.params as ToggleFeedPostReactionParams;
  const body = req.body as ToggleFeedPostReactionBody;
  const result = await feedService.toggleReaction(currentUserId, postId, body.reactionValue);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "FEED_POST_REACTION_TOGGLED",
    data: result
  });
};

export const deleteFeedPost: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const postId = (req.params as DeleteFeedPostParams).postId;
  const result = await feedService.deletePost(currentUserId, postId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "FEED_POST_DELETED",
    data: result
  });
};

export const downloadFeedAttachment: RequestHandler = async (req, res) => {
  const currentUserId = req.user?.sub as string;
  const { postId, attachmentId } = req.params as DownloadFeedAttachmentParams;
  const attachment = await feedService.downloadAttachment(currentUserId, postId, attachmentId);

  res.setHeader("Content-Type", attachment.mimeType);
  res.setHeader("Content-Length", attachment.sizeBytes.toString());
  res.setHeader("Content-Disposition", buildAttachmentDisposition(attachment.fileName));
  res.status(StatusCodes.OK).send(attachment.fileData);
};