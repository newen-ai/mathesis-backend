import type { ChatMemberRole, ChatType } from "@prisma/client";

export type ChatUserSummary = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  currentJobTitle: string | null;
  currentCompany: string | null;
};

export type ChatMemberSummary = {
  user: ChatUserSummary;
  role: ChatMemberRole;
  joinedAt: string;
};

export type ChatMessageSummary = {
  id: string;
  chatId: string;
  senderUserId: string;
  sender: ChatUserSummary;
  content: string | null;
  isDeleted: boolean;
  editedAt: string | null;
  createdAt: string;
};

export type ChatSummary = {
  id: string;
  type: ChatType;
  title: string | null;
  isAdmin: boolean;
  membersCount: number;
  unreadMessagesCount: number;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
};

export type ChatDetail = {
  id: string;
  type: ChatType;
  title: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  isAdmin: boolean;
  members: ChatMemberSummary[];
};

export type ListMyChatsOutput = {
  chats: ChatSummary[];
};

export type CreateDirectChatOutput = {
  chat: ChatDetail;
  alreadyExisted: boolean;
};

export type CreateGroupChatOutput = {
  chat: ChatDetail;
};

export type AddGroupMembersOutput = {
  chatId: string;
  members: ChatMemberSummary[];
};

export type SendMessageOutput = {
  message: ChatMessageSummary;
};

export type ReadMessagesOutput = {
  messages: ChatMessageSummary[];
  nextCursor: string | null;
};

export type EditMessageOutput = {
  message: ChatMessageSummary;
};

export type DeleteMessageOutput = {
  messageId: string;
  chatId: string;
  deletedAt: string;
};

export type ExitGroupOutput = {
  chatId: string;
  exitedAt: string;
};

export type UpdateGroupConfigOutput = {
  chat: ChatDetail;
};

export type MarkChatAsReadOutput = {
  chatId: string;
  lastReadMessageAt: string | null;
  unreadMessagesCount: number;
};

export type PromoteGroupAdminOutput = {
  chat: ChatDetail;
};

export type TransferGroupAdminOutput = {
  chat: ChatDetail;
};
