export type AteneoUserSummary = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
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
  isAdmin: boolean;
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
  initials: string;
  isAdmin: boolean;
  isPinned: boolean;
  joinedAt: string;
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
};

export type AteneoTopicCommentSummary = {
  id: string;
  topicId: string;
  author: AteneoUserSummary;
  content: string;
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

export type ListAteneoFeedOutput = {
  topics: AteneoTopicSummary[];
};

export type ListAteneoTopicsOutput = {
  topics: AteneoTopicSummary[];
};

export type GetAteneoTopicOutput = {
  topic: AteneoTopicSummary;
};

export type ListAteneoTopicCommentsOutput = {
  comments: AteneoTopicCommentSummary[];
};

export type CreateAteneoTopicOutput = {
  topic: AteneoTopicSummary;
};

export type CreateAteneoTopicCommentOutput = {
  comment: AteneoTopicCommentSummary;
};

export type ToggleAteneoTopicReactionOutput = {
  topic: AteneoTopicSummary;
};

export type ToggleAteneoTopicCommentReactionOutput = {
  comment: AteneoTopicCommentSummary;
};
