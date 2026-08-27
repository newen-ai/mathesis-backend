export type BlockedUserSummary = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  blockedAt: string;
  reasonNote: string | null;
};

export type BlockUserOutput = {
  targetUserId: string;
  blockedAt: string;
  alreadyBlocked: boolean;
};

export type UnblockUserOutput = {
  targetUserId: string;
  unblockedAt: string;
};

export type ListMyBlockedUsersOutput = {
  blockedUsers: BlockedUserSummary[];
};
