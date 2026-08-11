import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../common/errors/app-error";
import { prisma } from "../../common/prisma";
import type { CreateFeedPostBody, FeedPostReactionValue, FeedSortBy } from "./feed.schemas";
import type {
  CreateFeedPostOutput,
  DownloadFeedAttachmentOutput,
  DeleteFeedPostOutput,
  FeedAttachmentSummary,
  FeedPostSummary,
  FeedPostWithRelations,
  FeedUserSummary,
  ListFeedPostsOutput,
  ToggleFeedPostReactionOutput
} from "./feed.types";

const DEFAULT_FEED_LIMIT = 20;
const MAX_FEED_LIMIT = 50;
const MAX_FEED_CONTENT_LENGTH = 4000;
const MAX_PDF_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const DEFAULT_FEED_SORT_BY: FeedSortBy = "NEWEST";
const DEFAULT_FEED_HOT_GRAVITY = 1.8;

type UploadedPdfFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

type FeedSortConfig = {
  orderBy: Prisma.FeedPostOrderByWithRelationInput | Prisma.FeedPostOrderByWithRelationInput[];
};

type FeedDbSortBy = Exclude<FeedSortBy, "HOT">;

const FEED_SORT_CONFIG: Record<FeedDbSortBy, FeedSortConfig> = {
  NEWEST: {
    orderBy: {
      createdAt: "desc"
    }
  },
  OLDEST: {
    orderBy: {
      createdAt: "asc"
    }
  },
  RECENTLY_UPDATED: {
    orderBy: [
      {
        updatedAt: "desc"
      },
      {
        createdAt: "desc"
      }
    ]
  }
};

function mapUserSummary(user: {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    currentJobTitle: string | null;
    currentCompany: string | null;
    deletedAt: Date | null;
  } | null;
}): FeedUserSummary {
  const profile = user.profile && !user.profile.deletedAt ? user.profile : null;

  return {
    userId: user.id,
    firstName: profile?.firstName ?? null,
    lastName: profile?.lastName ?? null,
    profileImageUrl: profile?.profileImageUrl ?? null,
    currentJobTitle: profile?.currentJobTitle ?? null,
    currentCompany: profile?.currentCompany ?? null
  };
}

function mapAttachments(attachments: Array<{ id: string; fileName: string; mimeType: string; sizeBytes: number }>): FeedAttachmentSummary[] {
  return attachments.map((attachment) => ({
    id: attachment.id,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes
  }));
}

function mapFeedPost(post: FeedPostWithRelations, currentUserId: string): FeedPostSummary {
  const currentUserReactionValue = post.reactions.find((reaction) => reaction.userId === currentUserId)?.reactionValue ?? null;

  return {
    id: post.id,
    authorUserId: post.authorUserId,
    author: mapUserSummary(post.author),
    content: post.content,
    attachments: mapAttachments(post.attachments),
    reactionCount: post.reactionCount,
    currentUserReactionValue,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString()
  };
}

function buildFeedPostInclude(currentUserId: string) {
  return {
    author: {
      select: {
        id: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            currentJobTitle: true,
            currentCompany: true,
            deletedAt: true
          }
        }
      }
    },
    reactions: {
      where: {
        userId: currentUserId
      },
      select: {
        userId: true,
        reactionValue: true
      }
    },
    attachments: {
      where: {
        deletedAt: null
      },
      select: {
        id: true,
        fileName: true,
        mimeType: true,
        sizeBytes: true
      },
      orderBy: {
        createdAt: "asc" as const
      }
    }
  };
}

async function assertActiveUser(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, deletedAt: true }
  });

  if (!user || user.deletedAt) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }
}

async function canViewFeedPost(_currentUserId: string, postId: string): Promise<boolean> {
  const post = await prisma.feedPost.findFirst({
    where: {
      id: postId,
      deletedAt: null,
      author: {
        deletedAt: null
      }
    },
    select: {
      id: true
    }
  });

  return Boolean(post);
}

function normalizeFeedContent(content: string | undefined): string | null {
  if (content === undefined) {
    return null;
  }

  const trimmed = content.trim();

  if (trimmed.length === 0) {
    return null;
  }

  if (trimmed.length > MAX_FEED_CONTENT_LENGTH) {
    throw new AppError("Content is too long", StatusCodes.BAD_REQUEST);
  }

  return trimmed;
}

function assertPdfFiles(files: UploadedPdfFile[]): void {
  for (const file of files) {
    if (file.mimetype !== "application/pdf") {
      throw new AppError("Only PDF files are allowed", StatusCodes.BAD_REQUEST);
    }

    if (file.size > MAX_PDF_FILE_SIZE_BYTES) {
      throw new AppError("PDF file is too large", StatusCodes.BAD_REQUEST);
    }
  }
}

async function loadFeedPosts(limit: number, sortBy: FeedDbSortBy, currentUserId: string): Promise<FeedPostSummary[]> {
  const sortConfig = FEED_SORT_CONFIG[sortBy];

  const posts = await prisma.feedPost.findMany({
    where: {
      deletedAt: null,
      author: {
        is: {
          deletedAt: null
        }
      }
    },
    include: buildFeedPostInclude(currentUserId),
    orderBy: sortConfig.orderBy,
    take: limit
  });

  return posts.map((post) => mapFeedPost(post, currentUserId));
}

async function loadFeedPostsByIdsInOrder(postIds: string[], currentUserId: string): Promise<FeedPostSummary[]> {
  if (postIds.length === 0) {
    return [];
  }

  const posts = await prisma.feedPost.findMany({
    where: {
      id: {
        in: postIds
      },
      deletedAt: null,
      author: {
        is: {
          deletedAt: null
        }
      }
    },
    include: buildFeedPostInclude(currentUserId)
  });

  const byId = new Map(posts.map((post) => [post.id, post]));

  return postIds
    .map((postId) => byId.get(postId))
    .filter((post): post is FeedPostWithRelations => Boolean(post))
    .map((post) => mapFeedPost(post, currentUserId));
}

async function loadHotFeedPosts(limit: number, gravity: number, currentUserId: string): Promise<FeedPostSummary[]> {
  const scoredRows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT fp.id
    FROM feed_posts fp
    INNER JOIN users u ON u.id = fp.author_user_id
    WHERE fp.deleted_at IS NULL
      AND u.deleted_at IS NULL
    ORDER BY (
      (fp.reaction_count - 1)::double precision
      /
      POWER(((EXTRACT(EPOCH FROM (NOW() - fp.created_at)) / 3600.0) + 2.0), ${gravity})
    ) DESC,
    fp.created_at DESC
    LIMIT ${limit}
  `);

  const postIds = scoredRows.map((row) => row.id);
  return loadFeedPostsByIdsInOrder(postIds, currentUserId);
}

async function loadFeedPostById(postId: string, currentUserId: string): Promise<FeedPostSummary> {
  const post = await prisma.feedPost.findFirst({
    where: {
      id: postId,
      deletedAt: null,
      author: {
        deletedAt: null
      }
    },
    include: buildFeedPostInclude(currentUserId)
  });

  if (!post) {
    throw new AppError("Feed post not found", StatusCodes.NOT_FOUND);
  }

  return mapFeedPost(post, currentUserId);
}

export const feedService = {
  async createPost(currentUserId: string, body: CreateFeedPostBody, files: UploadedPdfFile[]): Promise<CreateFeedPostOutput> {
    await assertActiveUser(currentUserId);

    const content = normalizeFeedContent(body.content);
    assertPdfFiles(files);

    if (!content && files.length === 0) {
      throw new AppError("Content or PDF files are required", StatusCodes.BAD_REQUEST);
    }

    const post = await prisma.feedPost.create({
      data: {
        authorUserId: currentUserId,
        content,
        attachments: {
          create: files.map((file) => ({
            fileName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            fileData: file.buffer
          }))
        }
      },
      include: buildFeedPostInclude(currentUserId)
    });

    return {
      post: mapFeedPost(post, currentUserId)
    };
  },

  async listFeedPosts(
    currentUserId: string,
    limit?: number,
    sortBy: FeedSortBy = DEFAULT_FEED_SORT_BY,
    gravity = DEFAULT_FEED_HOT_GRAVITY
  ): Promise<ListFeedPostsOutput> {
    const safeLimit = Math.min(Math.max(limit ?? DEFAULT_FEED_LIMIT, 1), MAX_FEED_LIMIT);

    if (sortBy === "HOT") {
      return {
        posts: await loadHotFeedPosts(safeLimit, gravity, currentUserId)
      };
    }

    return {
      posts: await loadFeedPosts(safeLimit, sortBy, currentUserId)
    };
  },

  async toggleReaction(
    currentUserId: string,
    postId: string,
    reactionValue: FeedPostReactionValue
  ): Promise<ToggleFeedPostReactionOutput> {
    await assertActiveUser(currentUserId);

    const hasPostAccess = await canViewFeedPost(currentUserId, postId);

    if (!hasPostAccess) {
      throw new AppError("Feed post not found", StatusCodes.NOT_FOUND);
    }

    const existingReaction = await prisma.feedPostReaction.findUnique({
      where: {
        feedPostId_userId: {
          feedPostId: postId,
          userId: currentUserId
        }
      },
      select: {
        id: true,
        reactionValue: true
      }
    });

    if (existingReaction && existingReaction.reactionValue === reactionValue) {
      await prisma.$transaction([
        prisma.feedPostReaction.delete({
          where: {
            feedPostId_userId: {
              feedPostId: postId,
              userId: currentUserId
            }
          }
        }),
        prisma.feedPost.update({
          where: {
            id: postId
          },
          data: {
            reactionCount: {
              decrement: 1
            }
          }
        })
      ]);
    } else if (existingReaction) {
      await prisma.feedPostReaction.update({
        where: {
          id: existingReaction.id
        },
        data: {
          reactionValue
        }
      });
    } else {
      await prisma.$transaction([
        prisma.feedPostReaction.create({
          data: {
            feedPostId: postId,
            userId: currentUserId,
            reactionValue
          }
        }),
        prisma.feedPost.update({
          where: {
            id: postId
          },
          data: {
            reactionCount: {
              increment: 1
            }
          }
        })
      ]);
    }

    return {
      post: await loadFeedPostById(postId, currentUserId)
    };
  },

  async deletePost(currentUserId: string, postId: string): Promise<DeleteFeedPostOutput> {
    await assertActiveUser(currentUserId);

    const result = await prisma.feedPost.updateMany({
      where: {
        id: postId,
        authorUserId: currentUserId,
        deletedAt: null
      },
      data: {
        deletedAt: new Date()
      }
    });

    if (result.count === 0) {
      throw new AppError("Feed post not found", StatusCodes.NOT_FOUND);
    }

    return {
      postId,
      deletedAt: new Date().toISOString()
    };
  },

  async downloadAttachment(
    currentUserId: string,
    postId: string,
    attachmentId: string
  ): Promise<DownloadFeedAttachmentOutput> {
    await assertActiveUser(currentUserId);

    const hasPostAccess = await canViewFeedPost(currentUserId, postId);

    if (!hasPostAccess) {
      throw new AppError("Feed attachment not found", StatusCodes.NOT_FOUND);
    }

    const attachment = await prisma.feedAttachment.findFirst({
      where: {
        id: attachmentId,
        feedPostId: postId,
        deletedAt: null,
        feedPost: {
          id: postId,
          deletedAt: null,
          author: {
            deletedAt: null
          }
        }
      },
      select: {
        fileName: true,
        mimeType: true,
        sizeBytes: true,
        fileData: true
      }
    });

    if (!attachment) {
      throw new AppError("Feed attachment not found", StatusCodes.NOT_FOUND);
    }

    return attachment;
  }
};