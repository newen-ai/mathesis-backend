import {
  AteneoModerationAction,
  AteneoModerationSource,
  AteneoModerationTargetType,
  NotificationLeadKind,
  NotificationLeadTone,
  NotificationType,
  Prisma
} from "@prisma/client";
import { AppError } from "../../common/errors/app-error";
import { prisma } from "../../common/prisma";
import { StatusCodes } from "http-status-codes";
import { env } from "../../config/env";
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
  KickAteneoGroupMemberBody,
  KickAteneoGroupMemberParams,
  ListAteneoGroupExpulsionsParams,
  ListAteneoGroupMembersParams,
  ListAteneoRemovedContentParams,
  ModerateRemoveAteneoCommentBody,
  ModerateRemoveAteneoCommentParams,
  ModerateRemoveAteneoTopicBody,
  ModerateRestoreAteneoCommentBody,
  ModerateRestoreAteneoCommentParams,
  ModerateRestoreAteneoTopicBody,
  RemovedAteneoTopicPreviewParams,
  RestoreAteneoGroupMemberParams,
  UpdateAteneoGroupBody,
  ToggleAteneoTopicCommentReactionBody,
  ToggleAteneoTopicReactionBody
} from "./ateneo.schemas";
import type {
  AteneoGroupDetail,
  AteneoGroupMemberSummary,
  AteneoGroupExpulsionSummary,
  AteneoGroupSummary,
  AteneoTopicAttachmentSummary,
  CreateAteneoGroupOutput,
  DeleteAteneoTopicOutput,
  JoinAteneoGroupOutput,
  AteneoTopicCommentSummary,
  AteneoTopicSummary,
  CreateAteneoTopicCommentOutput,
  CreateAteneoTopicOutput,
  GetAteneoTopicOutput,
  GetRemovedAteneoTopicPreviewOutput,
  DownloadAteneoTopicAttachmentOutput,
  ListAteneoFeedOutput,
  ListAteneoGroupsOutput,
  ListAteneoGroupExpulsionsOutput,
  ListAteneoGroupMembersOutput,
  ListAteneoRemovedContentOutput,
  ListAteneoTopicCommentsOutput,
  ListAteneoTopicsOutput,
  KickAteneoGroupMemberOutput,
  ModerateRemoveAteneoCommentOutput,
  ModerateRemoveAteneoTopicOutput,
  ModerateRestoreAteneoCommentOutput,
  ModerateRestoreAteneoTopicOutput,
  RestoreAteneoGroupMemberOutput,
  UpdateAteneoGroupOutput,
  ToggleAteneoTopicCommentReactionOutput,
  ToggleAteneoTopicReactionOutput
} from "./ateneo.types";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MAX_TOPIC_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_TOPIC_ATTACHMENTS = 5;
const DEFAULT_ATENEO_HOT_GRAVITY = 1.8;
const DEFAULT_ATENEO_HOT_COMMENT_WEIGHT = 1.5;
const ATENEO_HOT_FETCH_MULTIPLIER = 4;
const SHOULD_EXPOSE_ATENEO_HOT_SCORE = env.NODE_ENV === "local" || env.NODE_ENV === "dev";
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
  createdByUserId: string;
  description: string | null;
  createTopicsMode: AteneoPermissionMode;
  commentsMode: AteneoPermissionMode;
  memberSubtitle: string;
  activityLabel: string;
  icon: string;
  isOfficial: boolean;
  memberships: Array<{ userId: string; isAdmin: boolean; isPinned: boolean }>;
}, currentUserId: string, isJoinBlockedByExpulsion = false): AteneoGroupSummary {
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
    isJoinBlockedByExpulsion,
    isAdmin: Boolean(membership?.isAdmin),
    isOwner: group.createdByUserId === currentUserId,
    isPinned: Boolean(membership?.isPinned)
  };
}

function mapTopicSummary(
  topic: NonNullable<TopicWithRelations>,
  currentUserId: string,
  hotScore?: number
): AteneoTopicSummary {
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
    ...(SHOULD_EXPOSE_ATENEO_HOT_SCORE && typeof hotScore === "number" ? { hotScore } : {}),
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

function buildAteneoTopicReactionNotificationBody(reactionCount: number, groupId: string, topicId: string): Prisma.InputJsonValue {
  const countLabel = reactionCount === 1 ? "1 valoración" : `${reactionCount} valoraciones`;

  return [
    { text: "Tu tema recibió " },
    { text: countLabel, href: `/ateneo/groups/${encodeURIComponent(groupId)}/topics/${encodeURIComponent(topicId)}`, isBold: true },
    { text: ". Solo vos ves este número." }
  ];
}

async function syncAteneoTopicReactionNotification(groupId: string, topicId: string): Promise<void> {
  const topic = await prisma.ateneoTopic.findUnique({
    where: { id: topicId },
    select: {
      authorUserId: true,
      reactionCount: true,
    }
  });

  if (!topic) {
    return;
  }

  const seedKey = topicId;

  if (topic.reactionCount <= 0) {
    await prisma.notification.deleteMany({
      where: {
        userId: topic.authorUserId,
        seedKey,
      }
    });
    return;
  }

  await prisma.notification.upsert({
    where: {
      userId_seedKey: {
        userId: topic.authorUserId,
        seedKey,
      }
    },
    create: {
      userId: topic.authorUserId,
      seedKey,
      type: "POST_REACTION",
      leadKind: NotificationLeadKind.SYMBOL,
      leadValue: "↑",
      leadTone: NotificationLeadTone.GOLD,
      bodyJson: buildAteneoTopicReactionNotificationBody(topic.reactionCount, groupId, topicId),
      isRead: false,
      readAt: null,
    },
    update: {
      type: "POST_REACTION",
      leadKind: NotificationLeadKind.SYMBOL,
      leadValue: "↑",
      leadTone: NotificationLeadTone.GOLD,
      bodyJson: buildAteneoTopicReactionNotificationBody(topic.reactionCount, groupId, topicId),
      isRead: false,
      readAt: null,
    }
  });
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
}, groupOwnerUserId: string): AteneoGroupMemberSummary {
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
    isOwner: member.userId === groupOwnerUserId,
    isPinned: member.isPinned,
    joinedAt: member.joinedAt.toISOString()
  };
}

function normalizeOptionalReason(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function buildKickNotificationBody(groupName: string, reason: string | null): Prisma.InputJsonValue {
  const body: Array<{ text: string; href?: string; isBold?: boolean }> = [
    { text: "Fuiste expulsado del grupo " },
    { text: groupName, isBold: true },
    { text: "." }
  ];

  if (reason) {
    body.push({ text: ` Motivo: ${reason}` });
  }

  return body;
}

function mapGroupExpulsionSummary(expulsion: {
  userId: string;
  reason: string | null;
  kickedAt: Date;
  sourceContext: "MEMBERS_LIST" | "TOPIC" | "COMMENT" | "ADMIN_PANEL";
  sourceTopicId: string | null;
  sourceCommentId: string | null;
  targetWasAdmin: boolean;
  user: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      profileImageUrl: string | null;
    } | null;
  };
  kickedBy: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      profileImageUrl: string | null;
    } | null;
  };
}): AteneoGroupExpulsionSummary {
  return {
    ...mapUserSummary(expulsion.user),
    reason: expulsion.reason,
    kickedAt: expulsion.kickedAt.toISOString(),
    kickedBy: mapUserSummary(expulsion.kickedBy),
    sourceContext: expulsion.sourceContext,
    sourceTopicId: expulsion.sourceTopicId,
    sourceCommentId: expulsion.sourceCommentId,
    targetWasAdmin: expulsion.targetWasAdmin
  };
}

async function createContentModerationAudit(
  tx: Prisma.TransactionClient,
  input: {
    groupId: string;
    targetType: "MEMBER" | "TOPIC" | "COMMENT";
    action: "KICK" | "RESTORE_MEMBER" | "REMOVE_TOPIC" | "RESTORE_TOPIC" | "REMOVE_COMMENT" | "RESTORE_COMMENT";
    actorUserId: string;
    targetUserId: string | null;
    topicId: string | null;
    commentId: string | null;
    reason: string | null;
    sourceContext: "MEMBERS_LIST" | "TOPIC" | "COMMENT" | "TOPIC_MENU" | "COMMENT_MENU" | "ADMIN_PANEL";
  }
): Promise<void> {
  await tx.ateneoModerationAudit.create({
    data: {
      groupId: input.groupId,
      targetType: input.targetType as AteneoModerationTargetType,
      action: input.action as AteneoModerationAction,
      actorUserId: input.actorUserId,
      targetUserId: input.targetUserId,
      topicId: input.topicId,
      commentId: input.commentId,
      reason: input.reason,
      sourceContext: input.sourceContext as AteneoModerationSource
    }
  });
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

async function getGroupForModeration(groupId: string, currentUserId: string) {
  const group = await prisma.ateneoGroup.findFirst({
    where: {
      id: groupId,
      deletedAt: null
    },
    select: {
      id: true,
      name: true,
      createdByUserId: true,
      memberships: {
        where: {
          userId: currentUserId,
          deletedAt: null,
          leftAt: null
        },
        select: {
          userId: true,
          isAdmin: true
        }
      }
    }
  });

  if (!group) {
    throw new AppError("Ateneo group not found", StatusCodes.NOT_FOUND);
  }

  const actorMembership = group.memberships[0];
  if (!actorMembership || !actorMembership.isAdmin) {
    throw new AppError("Only group admins can manage member expulsions", StatusCodes.FORBIDDEN);
  }

  return {
    group,
    actorIsOwner: group.createdByUserId === currentUserId
  };
}

async function refreshGroupMemberSubtitle(tx: Prisma.TransactionClient, groupId: string): Promise<void> {
  const activeMembers = await tx.ateneoGroupMember.count({
    where: {
      groupId,
      deletedAt: null,
      leftAt: null
    }
  });

  await tx.ateneoGroup.update({
    where: { id: groupId },
    data: {
      memberSubtitle: `${activeMembers} ${activeMembers === 1 ? "miembro" : "miembros"}`,
      activityLabel: activeMembers > 0 ? "Activo hoy" : "Sin actividad"
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

function buildTopicInclude(currentUserId: string) {
  return {
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
        createdAt: "asc" as const
      }
    }
  };
}

async function loadTopicsByIdsInOrder(
  topicRows: Array<{ id: string; hotScore: number }>,
  currentUserId: string,
  blockedUserIds: Set<string>,
  scope: { type: "feed" } | { type: "group"; groupId: string }
): Promise<AteneoTopicSummary[]> {
  if (topicRows.length === 0) {
    return [];
  }

  const topicIds = topicRows.map((row) => row.id);
  const hotScoreById = new Map(topicRows.map((row) => [row.id, row.hotScore]));

  const blockedUserIdNotInFilter = blockService.buildBlockedUserIdNotInFilter(blockedUserIds);

  const topics = await prisma.ateneoTopic.findMany({
    where: {
      id: {
        in: topicIds
      },
      ...(blockedUserIdNotInFilter
        ? {
            authorUserId: blockedUserIdNotInFilter
          }
        : {}),
      deletedAt: null,
      group: {
        deletedAt: null,
        ...(scope.type === "feed"
          ? {
              memberships: {
                some: {
                  userId: currentUserId,
                  deletedAt: null,
                  leftAt: null
                }
              }
            }
          : {
              id: scope.groupId
            })
      }
    },
    include: buildTopicInclude(currentUserId)
  });

  const byId = new Map(topics.map((topic) => [topic.id, topic]));

  return topicIds
    .map((topicId) => byId.get(topicId))
    .filter((topic): topic is NonNullable<typeof topic> => Boolean(topic))
    .map((topic) => mapTopicSummary(topic, currentUserId, hotScoreById.get(topic.id)));
}

async function loadHotTopicRows(
  currentUserId: string,
  limit: number,
  blockedUserIds: Set<string>,
  scope: { type: "feed" } | { type: "group"; groupId: string }
): Promise<Array<{ id: string; hotScore: number }>> {
  const blockedUserIdsArray = Array.from(blockedUserIds);

  const scoredRows = await prisma.$queryRaw<Array<{ id: string; hot_score: number }>>(Prisma.sql`
    SELECT
      t.id,
      (
        ((GREATEST(t.reaction_count, 0)::double precision + (GREATEST(t.comment_count, 0)::double precision * ${DEFAULT_ATENEO_HOT_COMMENT_WEIGHT})) - 1.0)
        /
        POWER(((EXTRACT(EPOCH FROM (NOW() - t.created_at)) / 3600.0) + 2.0), ${DEFAULT_ATENEO_HOT_GRAVITY})
      ) AS hot_score
    FROM ateneo_topics t
    INNER JOIN ateneo_groups g ON g.id = t.group_id
    ${scope.type === "feed"
      ? Prisma.sql`INNER JOIN ateneo_group_members gm ON gm.group_id = g.id`
      : Prisma.empty}
    WHERE t.deleted_at IS NULL
      AND g.deleted_at IS NULL
      ${scope.type === "feed"
        ? Prisma.sql`AND gm.user_id = ${currentUserId} AND gm.deleted_at IS NULL AND gm.left_at IS NULL`
        : Prisma.sql`AND t.group_id = ${scope.groupId}`}
      ${blockedUserIdsArray.length > 0
        ? Prisma.sql`AND t.author_user_id NOT IN (${Prisma.join(blockedUserIdsArray)})`
        : Prisma.empty}
    ORDER BY hot_score DESC,
    t.created_at DESC
    LIMIT ${limit * ATENEO_HOT_FETCH_MULTIPLIER}
  `);

  return scoredRows.map((row) => ({
    id: row.id,
    hotScore: row.hot_score
  }));
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
    const topicRows = await loadHotTopicRows(currentUserId, take, blockedUserIds, { type: "feed" });
    const topics = await loadTopicsByIdsInOrder(topicRows, currentUserId, blockedUserIds, { type: "feed" });

    return {
      topics: topics.slice(0, take)
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

    const isCurrentUserMember = group.memberships.length > 0;
    const activeExpulsion = isCurrentUserMember
      ? null
      : await prisma.ateneoGroupExpulsion.findUnique({
          where: {
            groupId_userId: {
              groupId: group.id,
              userId: currentUserId
            }
          },
          select: {
            liftedAt: true
          }
        });

    const isJoinBlockedByExpulsion = Boolean(activeExpulsion && activeExpulsion.liftedAt === null);

    return {
      group: mapGroupSummary(group, currentUserId, isJoinBlockedByExpulsion),
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

    const groupOwner = await prisma.ateneoGroup.findFirst({
      where: {
        id: params.groupId,
        deletedAt: null
      },
      select: {
        createdByUserId: true
      }
    });

    if (!groupOwner) {
      throw new AppError("Ateneo group not found", StatusCodes.NOT_FOUND);
    }

    return {
      members: members.map((member) => mapGroupMemberSummary(member, groupOwner.createdByUserId))
    };
  },

  async listGroupExpulsions(currentUserId: string, params: ListAteneoGroupExpulsionsParams): Promise<ListAteneoGroupExpulsionsOutput> {
    await getGroupForModeration(params.groupId, currentUserId);

    const expulsions = await prisma.ateneoGroupExpulsion.findMany({
      where: {
        groupId: params.groupId,
        liftedAt: null
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
        },
        kickedBy: {
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
      orderBy: {
        kickedAt: "desc"
      }
    });

    return {
      expulsions: expulsions.map((expulsion) => mapGroupExpulsionSummary(expulsion))
    };
  },

  async listRemovedContent(currentUserId: string, params: ListAteneoRemovedContentParams): Promise<ListAteneoRemovedContentOutput> {
    await getGroupForModeration(params.groupId, currentUserId);

    const [topics, comments] = await Promise.all([
      prisma.ateneoTopic.findMany({
        where: {
          groupId: params.groupId,
          deletedAt: {
            not: null
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
          }
        },
        orderBy: {
          deletedAt: "desc"
        }
      }),
      prisma.ateneoTopicComment.findMany({
        where: {
          deletedAt: {
            not: null
          },
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
          }
        },
        orderBy: {
          deletedAt: "desc"
        }
      })
    ]);

    return {
      topics: topics.map((topic) => ({
        topicId: topic.id,
        title: topic.title,
        author: mapUserSummary(topic.author),
        deletedAt: (topic.deletedAt ?? topic.updatedAt).toISOString()
      })),
      comments: comments.map((comment) => ({
        commentId: comment.id,
        topicId: comment.topicId,
        contentPreview: comment.content.slice(0, 180),
        author: mapUserSummary(comment.author),
        deletedAt: (comment.deletedAt ?? comment.updatedAt).toISOString()
      }))
    };
  },

  async kickGroupMember(
    currentUserId: string,
    params: KickAteneoGroupMemberParams,
    body: KickAteneoGroupMemberBody
  ): Promise<KickAteneoGroupMemberOutput> {
    const { group, actorIsOwner } = await getGroupForModeration(params.groupId, currentUserId);

    if (params.targetUserId === currentUserId) {
      throw new AppError("You cannot kick yourself", StatusCodes.BAD_REQUEST);
    }

    const targetMembership = await prisma.ateneoGroupMember.findFirst({
      where: {
        groupId: params.groupId,
        userId: params.targetUserId,
        deletedAt: null,
        leftAt: null
      },
      select: {
        id: true,
        isAdmin: true
      }
    });

    if (!targetMembership) {
      throw new AppError("Target user is not an active group member", StatusCodes.NOT_FOUND);
    }

    if (params.targetUserId === group.createdByUserId) {
      throw new AppError("Group owner cannot be kicked", StatusCodes.FORBIDDEN);
    }

    if (targetMembership.isAdmin && !actorIsOwner) {
      throw new AppError("Only owner can kick other admins", StatusCodes.FORBIDDEN);
    }

    const reason = normalizeOptionalReason(body.reason);

    await prisma.$transaction(async (tx) => {
      await tx.ateneoGroupMember.update({
        where: { id: targetMembership.id },
        data: {
          deletedAt: new Date(),
          leftAt: new Date(),
          isPinned: false
        }
      });

      await tx.ateneoGroupExpulsion.upsert({
        where: {
          groupId_userId: {
            groupId: params.groupId,
            userId: params.targetUserId
          }
        },
        create: {
          groupId: params.groupId,
          userId: params.targetUserId,
          kickedByUserId: currentUserId,
          reason,
          sourceContext: body.sourceContext,
          sourceTopicId: body.sourceTopicId ?? null,
          sourceCommentId: body.sourceCommentId ?? null,
          targetWasAdmin: targetMembership.isAdmin,
          kickedAt: new Date(),
          liftedAt: null,
          liftedByUserId: null
        },
        update: {
          kickedByUserId: currentUserId,
          reason,
          sourceContext: body.sourceContext,
          sourceTopicId: body.sourceTopicId ?? null,
          sourceCommentId: body.sourceCommentId ?? null,
          targetWasAdmin: targetMembership.isAdmin,
          kickedAt: new Date(),
          liftedAt: null,
          liftedByUserId: null
        }
      });

      await createContentModerationAudit(tx, {
        groupId: params.groupId,
        targetType: "MEMBER",
        action: "KICK",
        actorUserId: currentUserId,
        targetUserId: params.targetUserId,
        topicId: body.sourceTopicId ?? null,
        commentId: body.sourceCommentId ?? null,
        reason,
        sourceContext: body.sourceContext
      });

      await tx.notification.create({
        data: {
          userId: params.targetUserId,
          type: NotificationType.GROUP_MEMBER_KICKED,
          seedKey: `group-kick-${params.groupId}-${Date.now()}`,
          leadKind: NotificationLeadKind.SYMBOL,
          leadValue: "⊖",
          leadTone: NotificationLeadTone.RED,
          bodyJson: buildKickNotificationBody(group.name, reason),
          isRead: false,
          readAt: null
        }
      });

      await refreshGroupMemberSubtitle(tx, params.groupId);
    });

    return {
      removedUserId: params.targetUserId
    };
  },

  async restoreGroupMember(currentUserId: string, params: RestoreAteneoGroupMemberParams): Promise<RestoreAteneoGroupMemberOutput> {
    const { actorIsOwner } = await getGroupForModeration(params.groupId, currentUserId);

    const expulsion = await prisma.ateneoGroupExpulsion.findUnique({
      where: {
        groupId_userId: {
          groupId: params.groupId,
          userId: params.targetUserId
        }
      },
      select: {
        userId: true,
        targetWasAdmin: true,
        liftedAt: true
      }
    });

    if (!expulsion || expulsion.liftedAt !== null) {
      throw new AppError("Target user is not currently expelled", StatusCodes.NOT_FOUND);
    }

    if (expulsion.targetWasAdmin && !actorIsOwner) {
      throw new AppError("Only owner can restore expelled admins", StatusCodes.FORBIDDEN);
    }

    await prisma.$transaction(async (tx) => {
      await tx.ateneoGroupExpulsion.update({
        where: {
          groupId_userId: {
            groupId: params.groupId,
            userId: params.targetUserId
          }
        },
        data: {
          liftedAt: new Date(),
          liftedByUserId: currentUserId
        }
      });

      await tx.ateneoGroupMember.upsert({
        where: {
          groupId_userId: {
            groupId: params.groupId,
            userId: params.targetUserId
          }
        },
        create: {
          groupId: params.groupId,
          userId: params.targetUserId,
          isAdmin: false,
          isPinned: false
        },
        update: {
          deletedAt: null,
          leftAt: null,
          isAdmin: false,
          isPinned: false
        }
      });

      await createContentModerationAudit(tx, {
        groupId: params.groupId,
        targetType: "MEMBER",
        action: "RESTORE_MEMBER",
        actorUserId: currentUserId,
        targetUserId: params.targetUserId,
        topicId: null,
        commentId: null,
        reason: null,
        sourceContext: "ADMIN_PANEL"
      });

      await refreshGroupMemberSubtitle(tx, params.groupId);
    });

    return {
      restoredUserId: expulsion.userId
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

    const activeExpulsion = await prisma.ateneoGroupExpulsion.findUnique({
      where: {
        groupId_userId: {
          groupId: params.groupId,
          userId: currentUserId
        }
      },
      select: {
        liftedAt: true
      }
    });

    if (activeExpulsion && activeExpulsion.liftedAt === null) {
      throw new AppError("You were expelled from this group", StatusCodes.FORBIDDEN);
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

      await refreshGroupMemberSubtitle(tx, params.groupId);
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
    const topicRows = await loadHotTopicRows(currentUserId, take, blockedUserIds, {
      type: "group",
      groupId: params.groupId
    });
    const topics = await loadTopicsByIdsInOrder(topicRows, currentUserId, blockedUserIds, {
      type: "group",
      groupId: params.groupId
    });

    return {
      topics: topics.slice(0, take)
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

  async getRemovedTopicPreview(
    currentUserId: string,
    params: RemovedAteneoTopicPreviewParams
  ): Promise<GetRemovedAteneoTopicPreviewOutput> {
    await getGroupForModeration(params.groupId, currentUserId);

    const topic = await prisma.ateneoTopic.findFirst({
      where: {
        id: params.topicId,
        groupId: params.groupId,
        deletedAt: {
          not: null
        },
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
      }
    });

    if (!topic) {
      throw new AppError("Removed Ateneo topic not found", StatusCodes.NOT_FOUND);
    }

    return {
      topic: mapTopicSummary(topic, currentUserId),
      deletedAt: (topic.deletedAt ?? topic.updatedAt).toISOString()
    };
  },

  async deleteTopic(currentUserId: string, params: AteneoTopicParams): Promise<DeleteAteneoTopicOutput> {
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

    if (topic.authorUserId !== currentUserId) {
      throw new AppError("Only topic author can delete this topic", StatusCodes.FORBIDDEN);
    }

    await prisma.$transaction(async (tx) => {
      await tx.ateneoTopic.update({
        where: { id: topic.id },
        data: {
          deletedAt: new Date()
        }
      });

      await tx.notification.deleteMany({
        where: {
          userId: topic.authorUserId,
          seedKey: topic.id
        }
      });
    });

    return {
      topicId: topic.id
    };
  },

  async moderateRemoveTopic(
    currentUserId: string,
    params: AteneoTopicParams,
    body: ModerateRemoveAteneoTopicBody
  ): Promise<ModerateRemoveAteneoTopicOutput> {
    await getGroupForModeration(params.groupId, currentUserId);

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

    const reason = normalizeOptionalReason(body.reason);

    await prisma.$transaction(async (tx) => {
      await tx.ateneoTopic.update({
        where: { id: topic.id },
        data: {
          deletedAt: new Date()
        }
      });

      await tx.notification.deleteMany({
        where: {
          userId: topic.authorUserId,
          seedKey: topic.id
        }
      });

      await createContentModerationAudit(tx, {
        groupId: params.groupId,
        targetType: "TOPIC",
        action: "REMOVE_TOPIC",
        actorUserId: currentUserId,
        targetUserId: topic.authorUserId,
        topicId: topic.id,
        commentId: null,
        reason,
        sourceContext: "TOPIC_MENU"
      });
    });

    return {
      topicId: topic.id
    };
  },

  async moderateRestoreTopic(
    currentUserId: string,
    params: AteneoTopicParams,
    body: ModerateRestoreAteneoTopicBody
  ): Promise<ModerateRestoreAteneoTopicOutput> {
    await getGroupForModeration(params.groupId, currentUserId);

    const topic = await prisma.ateneoTopic.findFirst({
      where: {
        id: params.topicId,
        groupId: params.groupId,
        deletedAt: {
          not: null
        }
      },
      select: {
        id: true,
        authorUserId: true
      }
    });

    if (!topic) {
      throw new AppError("Ateneo topic not found or not removed", StatusCodes.NOT_FOUND);
    }

    const reason = normalizeOptionalReason(body.reason);

    await prisma.$transaction(async (tx) => {
      await tx.ateneoTopic.update({
        where: { id: topic.id },
        data: {
          deletedAt: null
        }
      });

      await createContentModerationAudit(tx, {
        groupId: params.groupId,
        targetType: "TOPIC",
        action: "RESTORE_TOPIC",
        actorUserId: currentUserId,
        targetUserId: topic.authorUserId,
        topicId: topic.id,
        commentId: null,
        reason,
        sourceContext: "TOPIC_MENU"
      });
    });

    return {
      topicId: topic.id
    };
  },

  async moderateRemoveComment(
    currentUserId: string,
    params: ModerateRemoveAteneoCommentParams,
    body: ModerateRemoveAteneoCommentBody
  ): Promise<ModerateRemoveAteneoCommentOutput> {
    await getGroupForModeration(params.groupId, currentUserId);

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
        authorUserId: true,
        topicId: true
      }
    });

    if (!comment) {
      throw new AppError("Ateneo comment not found", StatusCodes.NOT_FOUND);
    }

    const reason = normalizeOptionalReason(body.reason);

    await prisma.$transaction(async (tx) => {
      await tx.ateneoTopicComment.update({
        where: { id: comment.id },
        data: {
          deletedAt: new Date()
        }
      });

      await tx.ateneoTopic.update({
        where: { id: params.topicId },
        data: {
          commentCount: {
            decrement: 1
          }
        }
      });

      await createContentModerationAudit(tx, {
        groupId: params.groupId,
        targetType: "COMMENT",
        action: "REMOVE_COMMENT",
        actorUserId: currentUserId,
        targetUserId: comment.authorUserId,
        topicId: comment.topicId,
        commentId: comment.id,
        reason,
        sourceContext: "COMMENT_MENU"
      });
    });

    return {
      commentId: comment.id
    };
  },

  async moderateRestoreComment(
    currentUserId: string,
    params: ModerateRestoreAteneoCommentParams,
    body: ModerateRestoreAteneoCommentBody
  ): Promise<ModerateRestoreAteneoCommentOutput> {
    await getGroupForModeration(params.groupId, currentUserId);

    const comment = await prisma.ateneoTopicComment.findFirst({
      where: {
        id: params.commentId,
        topicId: params.topicId,
        deletedAt: {
          not: null
        },
        topic: {
          groupId: params.groupId,
          deletedAt: null
        }
      },
      select: {
        id: true,
        authorUserId: true,
        topicId: true
      }
    });

    if (!comment) {
      throw new AppError("Ateneo comment not found or not removed", StatusCodes.NOT_FOUND);
    }

    const reason = normalizeOptionalReason(body.reason);

    await prisma.$transaction(async (tx) => {
      await tx.ateneoTopicComment.update({
        where: { id: comment.id },
        data: {
          deletedAt: null
        }
      });

      await tx.ateneoTopic.update({
        where: { id: comment.topicId },
        data: {
          commentCount: {
            increment: 1
          }
        }
      });

      await createContentModerationAudit(tx, {
        groupId: params.groupId,
        targetType: "COMMENT",
        action: "RESTORE_COMMENT",
        actorUserId: currentUserId,
        targetUserId: comment.authorUserId,
        topicId: comment.topicId,
        commentId: comment.id,
        reason,
        sourceContext: "COMMENT_MENU"
      });
    });

    return {
      commentId: comment.id
    };
  },

  async listTopicComments(currentUserId: string, params: AteneoTopicParams): Promise<ListAteneoTopicCommentsOutput> {
    await ensureGroupAccess(params.groupId, currentUserId);
    const blockedUserIds = await blockService.getBlockedUserIdsFor(currentUserId);

    const comments = await prisma.ateneoTopicComment.findMany({
      where: {
        topicId: params.topicId,
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
        .filter((comment) => comment.deletedAt === null && blockedUserIds.has(comment.authorUserId))
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
      const isModerationDeleted = comment.deletedAt !== null;
      const isHiddenByBlock = hiddenCommentIds.has(comment.id);

      if (!isModerationDeleted && !isHiddenByBlock) {
        commentsToReturn.push(mapCommentSummary(comment, currentUserId));
        continue;
      }

      const hasVisibleReply = (commentsByParentId.get(comment.id) ?? []).some(
        (reply) => reply.deletedAt === null && !hiddenCommentIds.has(reply.id)
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

    await syncAteneoTopicReactionNotification(params.groupId, params.topicId);

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
