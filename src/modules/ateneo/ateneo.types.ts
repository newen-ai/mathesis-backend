export type AteneoUserSummary = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  initials: string;
};

export type AteneoGroupSummary = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  createTopicsMode: "free" | "admins";
  commentsMode: "free" | "admins";
  subtitle: string;
  activity: string;
  icon: string;
  isOfficial: boolean;
  isMember: boolean;
  isJoinBlockedByExpulsion: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isPinned: boolean;
};

export type AteneoGroupDetail = {
  group: AteneoGroupSummary;
  rules: string[];
};

export type AteneoGroupMemberSummary = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  initials: string;
  isAdmin: boolean;
  isOwner: boolean;
  isPinned: boolean;
  joinedAt: string;
};

export type AteneoGroupExpulsionSummary = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  initials: string;
  reason: string | null;
  kickedAt: string;
  kickedBy: AteneoUserSummary;
  sourceContext: "MEMBERS_LIST" | "TOPIC" | "COMMENT" | "ADMIN_PANEL";
  sourceTopicId: string | null;
  sourceCommentId: string | null;
  targetWasAdmin: boolean;
};

export type AteneoTopicSummary = {
  id: string;
  groupId: string;
  groupLabel: string;
  author: AteneoUserSummary;
  timeLabel: string;
  title: string;
  description: string;
  tone: "LIBRE" | "SERIO" | "RECOMENDADO";
  reactions: number;
  comments: number;
  isRecommended: boolean;
  createdAt: string;
  updatedAt: string;
  currentUserReactionValue: "value" | null;
  attachments: AteneoTopicAttachmentSummary[];
};

export type AteneoTopicAttachmentSummary = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  downloadUrl: string;
};

export type AteneoTopicCommentSummary = {
  id: string;
  topicId: string;
  author: AteneoUserSummary;
  content: string;
  isDeletedPlaceholder: boolean;
  timeLabel: string;
  createdAt: string;
  parentCommentId: string | null;
  mentionUserId: string | null;
  reactions: number;
  currentUserReactionValue: "value" | null;
};

export type ListAteneoGroupsOutput = {
  tab: "mine" | "discover" | "admin";
  groups: AteneoGroupSummary[];
};

export type CreateAteneoGroupOutput = {
  group: AteneoGroupSummary;
};

export type UpdateAteneoGroupOutput = {
  group: AteneoGroupSummary;
};

export type JoinAteneoGroupOutput = {
  group: AteneoGroupSummary;
};

export type ListAteneoGroupMembersOutput = {
  members: AteneoGroupMemberSummary[];
};

export type ListAteneoGroupExpulsionsOutput = {
  expulsions: AteneoGroupExpulsionSummary[];
};

export type KickAteneoGroupMemberOutput = {
  removedUserId: string;
};

export type RestoreAteneoGroupMemberOutput = {
  restoredUserId: string;
};

export type AteneoRemovedTopicSummary = {
  topicId: string;
  title: string;
  author: AteneoUserSummary;
  deletedAt: string;
};

export type AteneoRemovedCommentSummary = {
  commentId: string;
  topicId: string;
  contentPreview: string;
  author: AteneoUserSummary;
  deletedAt: string;
};

export type ListAteneoRemovedContentOutput = {
  topics: AteneoRemovedTopicSummary[];
  comments: AteneoRemovedCommentSummary[];
};

export type ListAteneoFeedOutput = {
  topics: AteneoTopicSummary[];
};

export type ListAteneoTopicsOutput = {
  topics: AteneoTopicSummary[];
};

export type GetAteneoTopicOutput = {
  topic: AteneoTopicSummary;
};

export type GetRemovedAteneoTopicPreviewOutput = {
  topic: AteneoTopicSummary;
  deletedAt: string;
};

export type DeleteAteneoTopicOutput = {
  topicId: string;
};

export type ModerateRemoveAteneoTopicOutput = {
  topicId: string;
};

export type ModerateRestoreAteneoTopicOutput = {
  topicId: string;
};

export type ListAteneoTopicCommentsOutput = {
  comments: AteneoTopicCommentSummary[];
};

export type CreateAteneoTopicOutput = {
  topic: AteneoTopicSummary;
};

export type DownloadAteneoTopicAttachmentOutput = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  fileData: Buffer;
};

export type CreateAteneoTopicCommentOutput = {
  comment: AteneoTopicCommentSummary;
};

export type ModerateRemoveAteneoCommentOutput = {
  commentId: string;
};

export type ModerateRestoreAteneoCommentOutput = {
  commentId: string;
};

export type ToggleAteneoTopicReactionOutput = {
  topic: AteneoTopicSummary;
};

export type ToggleAteneoTopicCommentReactionOutput = {
  comment: AteneoTopicCommentSummary;
};
