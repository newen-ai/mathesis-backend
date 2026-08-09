import type { Prisma } from "@prisma/client";
import type { FeedPostReactionValue } from "./feed.schemas";

export type FeedUserSummary = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  currentJobTitle: string | null;
  currentCompany: string | null;
};

export type FeedAttachmentSummary = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

export type FeedPostReactionSummary = {
  userId: string;
  reactionValue: FeedPostReactionValue;
};

export type FeedPostSummary = {
  id: string;
  authorUserId: string;
  author: FeedUserSummary;
  content: string | null;
  attachments: FeedAttachmentSummary[];
  reactionCount: number;
  currentUserReactionValue: FeedPostReactionValue | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateFeedPostOutput = {
  post: FeedPostSummary;
};

export type ListFeedPostsOutput = {
  posts: FeedPostSummary[];
};

export type DeleteFeedPostOutput = {
  postId: string;
  deletedAt: string;
};

export type DownloadFeedAttachmentOutput = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  fileData: Buffer;
};

export type ToggleFeedPostReactionOutput = {
  post: FeedPostSummary;
};

export type FeedPostWithRelations = Prisma.FeedPostGetPayload<{
  include: {
    author: {
      select: {
        id: true;
        profile: {
          select: {
            firstName: true;
            lastName: true;
            currentJobTitle: true;
            currentCompany: true;
            deletedAt: true;
          };
        };
      };
    };
    attachments: {
      where: {
        deletedAt: null;
      };
      select: {
        id: true;
        fileName: true;
        mimeType: true;
        sizeBytes: true;
      };
      orderBy: {
        createdAt: "asc";
      };
    };
    reactions: {
      where: {
        userId: string;
      };
      select: {
        userId: true;
        reactionValue: true;
      };
    };
  };
}>;