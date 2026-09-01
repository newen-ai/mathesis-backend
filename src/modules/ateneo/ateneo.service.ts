import { AppError } from "../../common/errors/app-error";
import { prisma } from "../../common/prisma";
import { StatusCodes } from "http-status-codes";
import { blockService } from "../block/block.service";
import type {
  AteneoCommentParams,
  AteneoGroupParams,
  AteneoTab,
  AteneoTopicAttachmentParams,
  AteneoTopicParams,
  AteneoPermissionMode,
  CreateAteneoTopicBody,
  CreateAteneoTopicCommentBody,
  CreateAteneoGroupBody,
  ListAteneoGroupMembersParams,
  UpdateAteneoGroupBody,
  ToggleAteneoTopicCommentReactionBody,
  ToggleAteneoTopicReactionBody
} from "./ateneo.schemas";
import type {
  AteneoGroupDetail,
  AteneoGroupMemberSummary,
  AteneoGroupSummary,
  AteneoTopicAttachmentSummary,
  CreateAteneoGroupOutput,
  JoinAteneoGroupOutput,
  AteneoTopicCommentSummary,
  AteneoTopicSummary,
  CreateAteneoTopicCommentOutput,
  CreateAteneoTopicOutput,
  GetAteneoTopicOutput,
  DownloadAteneoTopicAttachmentOutput,
  ListAteneoFeedOutput,
  ListAteneoGroupsOutput,
  ListAteneoGroupMembersOutput,
  ListAteneoTopicCommentsOutput,
  ListAteneoTopicsOutput,
  UpdateAteneoGroupOutput,
  ToggleAteneoTopicCommentReactionOutput,
  ToggleAteneoTopicReactionOutput
} from "./ateneo.types";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MAX_TOPIC_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_TOPIC_ATTACHMENTS = 5;
const ALLOWED_TOPIC_ATTACHMENT_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif"
]);

type TopicWithRelations = Awaited<ReturnType<typeof loadTopicById>>;
type CommentWithRelations = Awaited<ReturnType<typeof loadCommentById>>;
type UploadedTopicFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

function clampLimit(limit: number | undefined): number {
  return Math.min(Math.max(limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 70);
}

function toTimeLabel(value: Date): string {
  const diffMs = Date.now() - value.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) return `hace ${diffMinutes} min`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;

  const diffDays = Math.round(diffHours / 24);
  return `hace ${diffDays} d`;
}

function initialsFromName(firstName: string | null, lastName: string | null, email: string): string {
  const first = firstName?.trim().charAt(0) ?? "";
  const last = lastName?.trim().charAt(0) ?? "";
  const fallback = email.trim().charAt(0);
  const composed = `${first}${last}`.trim();
  return (composed || fallback || "U").toUpperCase();
}

function mapUserSummary(user: {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  } | null;
}) {
  const firstName = user.profile?.firstName ?? null;
  const lastName = user.profile?.lastName ?? null;
  const profileImageUrl = user.profile?.profileImageUrl ?? null;

  return {
    userId: user.id,
    firstName,
    lastName,
    profileImageUrl,
    initials: initialsFromName(firstName, lastName, user.email)
  };
}

function buildTopicAttachmentDownloadUrl(groupId: string, topicId: string, attachmentId: string): string {
  return `/api/v1/ateneo/groups/${encodeURIComponent(groupId)}/topics/${encodeURIComponent(topicId)}/attachments/${encodeURIComponent(attachmentId)}`;
}

function mapAttachmentSummary(
  groupId: string,
  topicId: string,
  attachment: { id: string; fileName: string; mimeType: string; sizeBytes: number }
): AteneoTopicAttachmentSummary {
  return {
    id: attachment.id,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes,
    downloadUrl: buildTopicAttachmentDownloadUrl(groupId, topicId, attachment.id)
  };
}

function mapGroupSummary(group: {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  createTopicsMode: AteneoPermissionMode;
  commentsMode: AteneoPermissionMode;
  memberSubtitle: string;
  activityLabel: string;
  icon: string;
  isOfficial: boolean;
  memberships: Array<{ userId: string; isAdmin: boolean; isPinned: boolean }>;
}, currentUserId: string): AteneoGroupSummary {
  const membership = group.memberships.find((item) => item.userId === currentUserId);

  return {
    id: group.id,
    slug: group.slug,
    name: group.name,
    description: group.description,
    createTopicsMode: group.createTopicsMode,
    commentsMode: group.commentsMode,
    subtitle: group.memberSubtitle,
    activity: group.activityLabel,
    icon: group.icon,
    isOfficial: group.isOfficial,
    isMember: Boolean(membership),
    isAdmin: Boolean(membership?.isAdmin),
    isPinned: Boolean(membership?.isPinned)
  };
}

function mapTopicSummary(topic: NonNullable<TopicWithRelations>, currentUserId: string): AteneoTopicSummary {
  const author = mapUserSummary(topic.author);
  const currentUserReaction = topic.reactions.find((item) => item.userId === currentUserId);

  return {
    id: topic.id,
    groupId: topic.groupId,
    groupLabel: topic.group.name,
    author,
    timeLabel: toTimeLabel(topic.createdAt),
    title: topic.title,
    description: topic.description,
    tone: topic.tone,
    reactions: topic.reactionCount,
    comments: topic.commentCount,
    isRecommended: topic.isRecommended,
    createdAt: topic.createdAt.toISOString(),
    updatedAt: topic.updatedAt.toISOString(),
    currentUserReactionValue: currentUserReaction?.reactionValue ?? null,
    attachments: topic.attachments.map((attachment) => mapAttachmentSummary(topic.groupId, topic.id, attachment))
  };
}

function mapCommentSummary(comment: NonNullable<CommentWithRelations>, currentUserId: string): AteneoTopicCommentSummary {
  const author = mapUserSummary(comment.author);
  const currentUserReaction = comment.reactions.find((item) => item.userId === currentUserId);

  return {
    id: comment.id,
    topicId: comment.topicId,
    author,
    content: comment.content,
    isDeletedPlaceholder: false,
    timeLabel: toTimeLabel(comment.createdAt),
    createdAt: comment.createdAt.toISOString(),
    parentCommentId: comment.parentCommentId,
    mentionUserId: comment.mentionUserId,
    reactions: comment.reactionCount,
    currentUserReactionValue: currentUserReaction?.reactionValue ?? null
  };
}

function mapDeletedCommentPlaceholder(comment: {
  id: string;
  topicId: string;
  createdAt: Date;
  parentCommentId: string | null;
}): AteneoTopicCommentSummary {
  return {
    id: comment.id,
    topicId: comment.topicId,
    author: {
      userId: "",
      firstName: null,
      lastName: null,
      profileImageUrl: null,
      initials: "?"
    },
    content: "Comentario eliminado",
    isDeletedPlaceholder: true,
    timeLabel: toTimeLabel(comment.createdAt),
    createdAt: comment.createdAt.toISOString(),
    parentCommentId: comment.parentCommentId,
    mentionUserId: null,
    reactions: 0,
    currentUserReactionValue: null
  };
}

function mapGroupMemberSummary(member: {
  userId: string;
  isAdmin: boolean;
  isPinned: boolean;
  joinedAt: Date;
  user: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      profileImageUrl: string | null;
    } | null;
  };
}): AteneoGroupMemberSummary {
  const firstName = member.user.profile?.firstName ?? null;
  const lastName = member.user.profile?.lastName ?? null;
  const profileImageUrl = member.user.profile?.profileImageUrl ?? null;

  return {
    userId: member.userId,
    firstName,
    lastName,
    profileImageUrl,
    initials: initialsFromName(firstName, lastName, member.user.email),
    isAdmin: member.isAdmin,
    isPinned: member.isPinned,
    joinedAt: member.joinedAt.toISOString()
  };
}

async function ensureGroupAccess(groupId: string, currentUserId: string): Promise<void> {
  const membership = await prisma.ateneoGroupMember.findFirst({
    where: {
      groupId,
      userId: currentUserId,
      deletedAt: null,
      leftAt: null,
      group: {
        deletedAt: null
      }
    },
    select: { id: true }
  });

  if (!membership) {
    throw new AppError("Ateneo group not found or inaccessible", StatusCodes.NOT_FOUND);
  }
}

async function getGroupMembership(groupId: string, currentUserId: string) {
  return prisma.ateneoGroup.findFirst({
    where: {
      id: groupId,
      deletedAt: null
    },
    include: {
      memberships: {
        where: {
          userId: currentUserId,
          deletedAt: null,
          leftAt: null
        },
        select: {
          userId: true,
          isAdmin: true,
          isPinned: true
        }
      }
    }
  });
}

function canAdminOnlyAction(group: { createTopicsMode: AteneoPermissionMode; commentsMode: AteneoPermissionMode; memberships: Array<{ isAdmin: boolean }> }, action: "createTopics" | "comments"): boolean {
  const requiresAdmin = action === "createTopics" ? group.createTopicsMode === "admins" : group.commentsMode === "admins";
  if (!requiresAdmin) {
    return true;
  }

  return group.memberships.some((membership) => membership.isAdmin);
}

function assertTopicAttachments(files: UploadedTopicFile[]): void {
  if (files.length > MAX_TOPIC_ATTACHMENTS) {
    throw new AppError("Too many attachments", StatusCodes.BAD_REQUEST);
  }

  for (const file of files) {
    if (!ALLOWED_TOPIC_ATTACHMENT_MIME_TYPES.has(file.mimetype)) {
      throw new AppError("Unsupported attachment type", StatusCodes.BAD_REQUEST);
    }

    if (file.size > MAX_TOPIC_ATTACHMENT_SIZE_BYTES) {
      throw new AppError("Attachment is too large", StatusCodes.BAD_REQUEST);
    }
  }
}

async function loadTopicById(topicId: string) {
  return prisma.ateneoTopic.findFirst({
    where: {
      id: topicId,
      deletedAt: null,
      group: {
        deletedAt: null
      }
    },
    include: {
      group: {
        select: {
          id: true,
          name: true
        }
      },
      author: {
        select: {
          id: true,
          email: true,
          profile: {
            where: { deletedAt: null },
            select: {
              firstName: true,
              lastName: true,
              profileImageUrl: true
            }
          }
        }
      },
      reactions: {
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
          createdAt: "asc"
        }
      }
    }
  });
}

async function loadCommentById(commentId: string) {
  return prisma.ateneoTopicComment.findFirst({
    where: {
      id: commentId,
      deletedAt: null,
      topic: {
        deletedAt: null,
        group: {
          deletedAt: null
        }
      }
    },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          profile: {
            where: { deletedAt: null },
            select: {
              firstName: true,
              lastName: true,
              profileImageUrl: true
            }
          }
        }
      },
      reactions: {
        select: {
          userId: true,
          reactionValue: true
        }
      }
    }
  });
}

export const ateneoService = {
  async createGroup(currentUserId: string, body: CreateAteneoGroupBody): Promise<CreateAteneoGroupOutput> {
    const baseSlug = toSlug(body.name) || "grupo";
    let slug = baseSlug;
    let suffix = 1;

    while (await prisma.ateneoGroup.findUnique({ where: { slug }, select: { id: true } })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const created = await prisma.$transaction(async (tx) => {
      const group = await tx.ateneoGroup.create({
        data: {
          slug,
          name: body.name.trim(),
          description: body.description?.trim(),
          icon: body.icon,
          isOfficial: Boolean(body.isOfficial),
          createTopicsMode: body.createTopicsMode,
          commentsMode: body.commentsMode,
          createdByUserId: currentUserId,
          memberSubtitle: "1 miembro",
          activityLabel: "Creado recientemente"
        }
      });

      await tx.ateneoGroupMember.create({
        data: {
          groupId: group.id,
          userId: currentUserId,
          isAdmin: true
        }
      });

      if (body.rules?.length) {
        await tx.ateneoGroupRule.createMany({
          data: body.rules.map((text, index) => ({
            groupId: group.id,
            text: text.trim(),
            position: index
          }))
        });
      }

      return group;
    });

    const hydrated = await prisma.ateneoGroup.findFirst({
      where: { id: created.id, deletedAt: null },
      include: {
        memberships: {
          where: {
            userId: currentUserId,
            deletedAt: null,
            leftAt: null
          },
          select: {
            userId: true,
            isAdmin: true,
            isPinned: true
          }
        }
      }
    });

    if (!hydrated) {
      throw new AppError("Ateneo group not found after create", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return {
      group: mapGroupSummary(hydrated, currentUserId)
    };
  },

  async listGroups(currentUserId: string, tab: AteneoTab = "mine", limit?: number): Promise<ListAteneoGroupsOutput> {
    const take = clampLimit(limit);

    const groups = await prisma.ateneoGroup.findMany({
      where: {
        deletedAt: null,
        memberships: tab === "discover"
          ? {
              none: {
                userId: currentUserId,
                deletedAt: null,
                leftAt: null
              }
            }
          : {
              some: {
                userId: currentUserId,
                deletedAt: null,
                leftAt: null,
                ...(tab === "admin" ? { isAdmin: true } : {})
              }
            }
      },
      include: {
        memberships: {
          where: {
            deletedAt: null,
            leftAt: null,
            userId: currentUserId
          },
          select: {
            userId: true,
            isAdmin: true,
            isPinned: true
          }
        }
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take
    });

    return {
      tab,
      groups: groups.map((group) => mapGroupSummary(group, currentUserId))
    };
  },

  async listFeed(currentUserId: string, limit?: number): Promise<ListAteneoFeedOutput> {
    const take = clampLimit(limit);
    const blockedUserIds = await blockService.getBlockedUserIdsFor(currentUserId);
    const blockedUserIdNotInFilter = blockService.buildBlockedUserIdNotInFilter(blockedUserIds);

    const topics = await prisma.ateneoTopic.findMany({
      where: {
        deletedAt: null,
        ...(blockedUserIdNotInFilter
          ? {
              authorUserId: blockedUserIdNotInFilter
            }
          : {}),
        group: {
          deletedAt: null,
          memberships: {
            some: {
              userId: currentUserId,
              deletedAt: null,
              leftAt: null
            }
          }
        }
      },
      include: {
        group: {
          select: {
            id: true,
            name: true
          }
        },
        author: {
          select: {
            id: true,
            email: true,
            profile: {
              where: { deletedAt: null },
              select: {
                firstName: true,
                lastName: true,
                profileImageUrl: true
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
            createdAt: "asc"
          }
        }
      },
      orderBy: [{ createdAt: "desc" }],
      take
    });

    return {
      topics: topics.map((topic) => mapTopicSummary(topic, currentUserId))
    };
  },

  async getGroup(currentUserId: string, params: AteneoGroupParams): Promise<AteneoGroupDetail> {
    const group = await prisma.ateneoGroup.findFirst({
      where: {
        id: params.groupId,
        deletedAt: null
      },
      include: {
        memberships: {
          where: {
            userId: currentUserId,
            deletedAt: null,
            leftAt: null
          },
          select: {
            userId: true,
            isAdmin: true,
            isPinned: true
          }
        },
        rules: {
          where: {
            deletedAt: null
          },
          orderBy: {
            position: "asc"
          },
          select: {
            text: true
          }
        }
      }
    });

    if (!group) {
      throw new AppError("Ateneo group not found", StatusCodes.NOT_FOUND);
    }

    return {
      group: mapGroupSummary(group, currentUserId),
      rules: group.rules.map((rule) => rule.text)
    };
  },

  async listGroupMembers(currentUserId: string, params: ListAteneoGroupMembersParams): Promise<ListAteneoGroupMembersOutput> {
    await ensureGroupAccess(params.groupId, currentUserId);
    const blockedUserIds = await blockService.getBlockedUserIdsFor(currentUserId);
    const blockedUserIdNotInFilter = blockService.buildBlockedUserIdNotInFilter(blockedUserIds);

    const members = await prisma.ateneoGroupMember.findMany({
      where: {
        groupId: params.groupId,
        ...(blockedUserIdNotInFilter
          ? {
              userId: blockedUserIdNotInFilter
            }
          : {}),
        deletedAt: null,
        leftAt: null,
        group: {
          deletedAt: null
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              where: { deletedAt: null },
              select: {
                firstName: true,
                lastName: true,
                profileImageUrl: true
              }
            }
          }
        }
      },
      orderBy: [{ isAdmin: "desc" }, { joinedAt: "asc" }]
    });

    return {
      members: members.map((member) => mapGroupMemberSummary(member))
    };
  },

  async joinGroup(currentUserId: string, params: AteneoGroupParams): Promise<JoinAteneoGroupOutput> {
    const group = await prisma.ateneoGroup.findFirst({
      where: {
        id: params.groupId,
        deletedAt: null
      },
      select: {
        id: true
      }
    });

    if (!group) {
      throw new AppError("Ateneo group not found", StatusCodes.NOT_FOUND);
    }

    await prisma.$transaction(async (tx) => {
      await tx.ateneoGroupMember.upsert({
        where: {
          groupId_userId: {
            groupId: params.groupId,
            userId: currentUserId
          }
        },
        update: {
          leftAt: null,
          deletedAt: null
        },
        create: {
          groupId: params.groupId,
          userId: currentUserId,
          isAdmin: false
        }
      });

      const activeMembers = await tx.ateneoGroupMember.count({
        where: {
          groupId: params.groupId,
          deletedAt: null,
          leftAt: null
        }
      });

      await tx.ateneoGroup.update({
        where: { id: params.groupId },
        data: {
          memberSubtitle: `${activeMembers} ${activeMembers === 1 ? "miembro" : "miembros"}`,
          activityLabel: "Activo hoy"
        }
      });
    });

    const hydrated = await prisma.ateneoGroup.findFirst({
      where: {
        id: params.groupId,
        deletedAt: null
      },
      include: {
        memberships: {
          where: {
            userId: currentUserId,
            deletedAt: null,
            leftAt: null
          },
          select: {
            userId: true,
            isAdmin: true,
            isPinned: true
          }
        }
      }
    });

    if (!hydrated) {
      throw new AppError("Ateneo group not found", StatusCodes.NOT_FOUND);
    }

    return {
      group: mapGroupSummary(hydrated, currentUserId)
    };
  },

  async updateGroup(currentUserId: string, params: AteneoGroupParams, body: UpdateAteneoGroupBody): Promise<UpdateAteneoGroupOutput> {
    const group = await prisma.ateneoGroup.findFirst({
      where: {
        id: params.groupId,
        deletedAt: null
      },
      include: {
        memberships: {
          where: {
            userId: currentUserId,
            deletedAt: null,
            leftAt: null
          },
          select: {
            userId: true,
            isAdmin: true,
            isPinned: true
          }
        }
      }
    });

    if (!group) {
      throw new AppError("Ateneo group not found", StatusCodes.NOT_FOUND);
    }

    if (!group.memberships.some((membership) => membership.isAdmin)) {
      throw new AppError("Only admins can edit this group", StatusCodes.FORBIDDEN);
    }

    await prisma.$transaction(async (tx) => {
      await tx.ateneoGroup.update({
        where: { id: params.groupId },
        data: {
          name: body.name.trim(),
          description: body.description?.trim() || null,
          icon: body.icon,
          isOfficial: Boolean(body.isOfficial),
          createTopicsMode: body.createTopicsMode,
          commentsMode: body.commentsMode
        }
      });

      await tx.ateneoGroupRule.deleteMany({
        where: {
          groupId: params.groupId,
          deletedAt: null
        }
      });

      if (body.rules?.length) {
        await tx.ateneoGroupRule.createMany({
          data: body.rules.map((text, index) => ({
            groupId: params.groupId,
            text: text.trim(),
            position: index
          }))
        });
      }
    });

    const hydrated = await prisma.ateneoGroup.findFirst({
      where: {
        id: params.groupId,
        deletedAt: null
      },
      include: {
        memberships: {
          where: {
            userId: currentUserId,
            deletedAt: null,
            leftAt: null
          },
          select: {
            userId: true,
            isAdmin: true,
            isPinned: true
          }
        }
      }
    });

    if (!hydrated) {
      throw new AppError("Ateneo group not found", StatusCodes.NOT_FOUND);
    }

    return {
      group: mapGroupSummary(hydrated, currentUserId)
    };
  },

  async listGroupTopics(currentUserId: string, params: AteneoGroupParams, limit?: number): Promise<ListAteneoTopicsOutput> {
    await ensureGroupAccess(params.groupId, currentUserId);
    const take = clampLimit(limit);
    const blockedUserIds = await blockService.getBlockedUserIdsFor(currentUserId);
    const blockedUserIdNotInFilter = blockService.buildBlockedUserIdNotInFilter(blockedUserIds);

    const topics = await prisma.ateneoTopic.findMany({
      where: {
        groupId: params.groupId,
        ...(blockedUserIdNotInFilter
          ? {
              authorUserId: blockedUserIdNotInFilter
            }
          : {}),
        deletedAt: null,
        group: {
          deletedAt: null
        }
      },
      include: {
        group: {
          select: {
            id: true,
            name: true
          }
        },
        author: {
          select: {
            id: true,
            email: true,
            profile: {
              where: { deletedAt: null },
              select: {
                firstName: true,
                lastName: true,
                profileImageUrl: true
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
            createdAt: "asc"
          }
        }
      },
      orderBy: [{ reactionCount: "desc" }, { createdAt: "desc" }],
      take
    });

    return {
      topics: topics.map((topic) => mapTopicSummary(topic, currentUserId))
    };
  },

  async createTopic(
    currentUserId: string,
    params: AteneoGroupParams,
    body: CreateAteneoTopicBody,
    files: UploadedTopicFile[] = []
  ): Promise<CreateAteneoTopicOutput> {
    await ensureGroupAccess(params.groupId, currentUserId);

    const group = await getGroupMembership(params.groupId, currentUserId);
    if (!group) {
      throw new AppError("Ateneo group not found or inaccessible", StatusCodes.NOT_FOUND);
    }

    if (!canAdminOnlyAction(group, "createTopics")) {
      throw new AppError("Only admins can create topics in this group", StatusCodes.FORBIDDEN);
    }

    assertTopicAttachments(files);

    const topic = await prisma.$transaction(async (tx) => {
      const createdTopic = await tx.ateneoTopic.create({
        data: {
          groupId: params.groupId,
          authorUserId: currentUserId,
          title: body.title.trim(),
          description: body.description.trim(),
          tone: body.tone
        }
      });

      if (files.length > 0) {
        await tx.ateneoTopicAttachment.createMany({
          data: files.map((file) => ({
            topicId: createdTopic.id,
            fileName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            fileData: file.buffer
          }))
        });
      }

      return createdTopic;
    });

    const hydrated = await loadTopicById(topic.id);
    if (!hydrated) {
      throw new AppError("Ateneo topic not found after create", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return {
      topic: mapTopicSummary(hydrated, currentUserId)
    };
  },

  async downloadTopicAttachment(
    currentUserId: string,
    params: AteneoTopicAttachmentParams
  ): Promise<DownloadAteneoTopicAttachmentOutput> {
    await ensureGroupAccess(params.groupId, currentUserId);

    const topic = await loadTopicById(params.topicId);
    if (!topic || topic.groupId !== params.groupId) {
      throw new AppError("Ateneo topic not found", StatusCodes.NOT_FOUND);
    }

    const blockedUserIds = await blockService.getBlockedUserIdsFor(currentUserId);
    if (blockedUserIds.has(topic.authorUserId)) {
      throw new AppError("Ateneo topic not found", StatusCodes.NOT_FOUND);
    }

    const attachment = await prisma.ateneoTopicAttachment.findFirst({
      where: {
        id: params.attachmentId,
        topicId: params.topicId,
        deletedAt: null,
        topic: {
          groupId: params.groupId,
          deletedAt: null
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
      throw new AppError("Ateneo attachment not found", StatusCodes.NOT_FOUND);
    }

    return attachment;
  },

  async getTopic(currentUserId: string, params: AteneoTopicParams): Promise<GetAteneoTopicOutput> {
    await ensureGroupAccess(params.groupId, currentUserId);
    const blockedUserIds = await blockService.getBlockedUserIdsFor(currentUserId);

    const topic = await loadTopicById(params.topicId);
    if (!topic || topic.groupId !== params.groupId) {
      throw new AppError("Ateneo topic not found", StatusCodes.NOT_FOUND);
    }

    if (blockedUserIds.has(topic.authorUserId)) {
      throw new AppError("Ateneo topic not found", StatusCodes.NOT_FOUND);
    }

    return {
      topic: mapTopicSummary(topic, currentUserId)
    };
  },

  async listTopicComments(currentUserId: string, params: AteneoTopicParams): Promise<ListAteneoTopicCommentsOutput> {
    await ensureGroupAccess(params.groupId, currentUserId);
    const blockedUserIds = await blockService.getBlockedUserIdsFor(currentUserId);

    const comments = await prisma.ateneoTopicComment.findMany({
      where: {
        topicId: params.topicId,
        deletedAt: null,
        topic: {
          groupId: params.groupId,
          deletedAt: null
        }
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            profile: {
              where: { deletedAt: null },
              select: {
                firstName: true,
                lastName: true,
                profileImageUrl: true
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
        }
      },
      orderBy: [{ createdAt: "asc" }]
    });

    const hiddenCommentIds = new Set(
      comments
        .filter((comment) => blockedUserIds.has(comment.authorUserId))
        .map((comment) => comment.id)
    );

    const commentsByParentId = new Map<string, Array<(typeof comments)[number]>>();

    for (const comment of comments) {
      if (!comment.parentCommentId) {
        continue;
      }

      const existing = commentsByParentId.get(comment.parentCommentId) ?? [];
      existing.push(comment);
      commentsByParentId.set(comment.parentCommentId, existing);
    }

    const commentsToReturn: AteneoTopicCommentSummary[] = [];

    for (const comment of comments) {
      if (!hiddenCommentIds.has(comment.id)) {
        commentsToReturn.push(mapCommentSummary(comment, currentUserId));
        continue;
      }

      const hasVisibleReply = (commentsByParentId.get(comment.id) ?? []).some(
        (reply) => !hiddenCommentIds.has(reply.id)
      );

      if (hasVisibleReply) {
        commentsToReturn.push(mapDeletedCommentPlaceholder(comment));
      }
    }

    return {
      comments: commentsToReturn
    };
  },

  async createTopicComment(
    currentUserId: string,
    params: AteneoTopicParams,
    body: CreateAteneoTopicCommentBody
  ): Promise<CreateAteneoTopicCommentOutput> {
    await ensureGroupAccess(params.groupId, currentUserId);

    const group = await getGroupMembership(params.groupId, currentUserId);
    if (!group) {
      throw new AppError("Ateneo group not found or inaccessible", StatusCodes.NOT_FOUND);
    }

    if (!canAdminOnlyAction(group, "comments")) {
      throw new AppError("Only admins can comment in this group", StatusCodes.FORBIDDEN);
    }

    const topic = await prisma.ateneoTopic.findFirst({
      where: {
        id: params.topicId,
        groupId: params.groupId,
        deletedAt: null
      },
      select: {
        id: true,
        authorUserId: true
      }
    });

    if (!topic) {
      throw new AppError("Ateneo topic not found", StatusCodes.NOT_FOUND);
    }

    const isTopicBlocked = await blockService.isEitherDirectionBlocked(currentUserId, topic.authorUserId);
    if (isTopicBlocked) {
      throw new AppError("Ateneo topic not found", StatusCodes.NOT_FOUND);
    }

    if (body.parentCommentId) {
      const parent = await prisma.ateneoTopicComment.findFirst({
        where: {
          id: body.parentCommentId,
          topicId: params.topicId,
          deletedAt: null
        },
        select: {
          id: true,
          authorUserId: true
        }
      });

      if (!parent) {
        throw new AppError("Parent comment not found", StatusCodes.NOT_FOUND);
      }

      const parentIsBlocked = await blockService.isEitherDirectionBlocked(currentUserId, parent.authorUserId);
      if (parentIsBlocked) {
        throw new AppError("Parent comment not found", StatusCodes.NOT_FOUND);
      }
    }

    if (body.mentionUserId) {
      const mentionIsBlocked = await blockService.isEitherDirectionBlocked(currentUserId, body.mentionUserId);
      if (mentionIsBlocked) {
        throw new AppError("Mention user is not available", StatusCodes.BAD_REQUEST);
      }
    }

    const comment = await prisma.$transaction(async (tx) => {
      const created = await tx.ateneoTopicComment.create({
        data: {
          topicId: params.topicId,
          authorUserId: currentUserId,
          content: body.content.trim(),
          parentCommentId: body.parentCommentId,
          mentionUserId: body.mentionUserId
        }
      });

      await tx.ateneoTopic.update({
        where: { id: params.topicId },
        data: {
          commentCount: {
            increment: 1
          }
        }
      });

      return created;
    });

    const hydrated = await loadCommentById(comment.id);
    if (!hydrated) {
      throw new AppError("Comment not found after create", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return {
      comment: mapCommentSummary(hydrated, currentUserId)
    };
  },

  async toggleTopicReaction(
    currentUserId: string,
    params: AteneoTopicParams,
    body: ToggleAteneoTopicReactionBody
  ): Promise<ToggleAteneoTopicReactionOutput> {
    await ensureGroupAccess(params.groupId, currentUserId);

    const topic = await prisma.ateneoTopic.findFirst({
      where: {
        id: params.topicId,
        groupId: params.groupId,
        deletedAt: null
      },
      select: {
        id: true,
        authorUserId: true
      }
    });

    if (!topic) {
      throw new AppError("Ateneo topic not found", StatusCodes.NOT_FOUND);
    }

    const isTopicBlocked = await blockService.isEitherDirectionBlocked(currentUserId, topic.authorUserId);
    if (isTopicBlocked) {
      throw new AppError("Ateneo topic not found", StatusCodes.NOT_FOUND);
    }

    const existing = await prisma.ateneoTopicReaction.findUnique({
      where: {
        topicId_userId: {
          topicId: params.topicId,
          userId: currentUserId
        }
      }
    });

    if (existing) {
      await prisma.$transaction([
        prisma.ateneoTopicReaction.delete({
          where: {
            topicId_userId: {
              topicId: params.topicId,
              userId: currentUserId
            }
          }
        }),
        prisma.ateneoTopic.update({
          where: { id: params.topicId },
          data: { reactionCount: { decrement: 1 } }
        })
      ]);
    } else {
      await prisma.$transaction([
        prisma.ateneoTopicReaction.create({
          data: {
            topicId: params.topicId,
            userId: currentUserId,
            reactionValue: body.reactionValue
          }
        }),
        prisma.ateneoTopic.update({
          where: { id: params.topicId },
          data: { reactionCount: { increment: 1 } }
        })
      ]);
    }

    const hydrated = await loadTopicById(params.topicId);
    if (!hydrated) {
      throw new AppError("Ateneo topic not found", StatusCodes.NOT_FOUND);
    }

    return {
      topic: mapTopicSummary(hydrated, currentUserId)
    };
  },

  async toggleCommentReaction(
    currentUserId: string,
    params: AteneoCommentParams,
    body: ToggleAteneoTopicCommentReactionBody
  ): Promise<ToggleAteneoTopicCommentReactionOutput> {
    await ensureGroupAccess(params.groupId, currentUserId);

    const comment = await prisma.ateneoTopicComment.findFirst({
      where: {
        id: params.commentId,
        topicId: params.topicId,
        deletedAt: null,
        topic: {
          groupId: params.groupId,
          deletedAt: null
        }
      },
      select: {
        id: true,
        authorUserId: true
      }
    });

    if (!comment) {
      throw new AppError("Ateneo comment not found", StatusCodes.NOT_FOUND);
    }

    const isCommentBlocked = await blockService.isEitherDirectionBlocked(currentUserId, comment.authorUserId);
    if (isCommentBlocked) {
      throw new AppError("Ateneo comment not found", StatusCodes.NOT_FOUND);
    }

    const existing = await prisma.ateneoTopicCommentReaction.findUnique({
      where: {
        commentId_userId: {
          commentId: params.commentId,
          userId: currentUserId
        }
      }
    });

    if (existing) {
      await prisma.$transaction([
        prisma.ateneoTopicCommentReaction.delete({
          where: {
            commentId_userId: {
              commentId: params.commentId,
              userId: currentUserId
            }
          }
        }),
        prisma.ateneoTopicComment.update({
          where: { id: params.commentId },
          data: { reactionCount: { decrement: 1 } }
        })
      ]);
    } else {
      await prisma.$transaction([
        prisma.ateneoTopicCommentReaction.create({
          data: {
            commentId: params.commentId,
            userId: currentUserId,
            reactionValue: body.reactionValue
          }
        }),
        prisma.ateneoTopicComment.update({
          where: { id: params.commentId },
          data: { reactionCount: { increment: 1 } }
        })
      ]);
    }

    const hydrated = await loadCommentById(params.commentId);
    if (!hydrated) {
      throw new AppError("Ateneo comment not found", StatusCodes.NOT_FOUND);
    }

    return {
      comment: mapCommentSummary(hydrated, currentUserId)
    };
  }
};
