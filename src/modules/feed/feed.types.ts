import type { Prisma } from "@prisma/client";

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

export type FeedPostSummary = {
  id: string;
  authorUserId: string;
  author: FeedUserSummary;
  content: string | null;
  attachments: FeedAttachmentSummary[];
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
  };
}>;