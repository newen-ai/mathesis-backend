export type NotificationLeadKindOutput = "INITIALS" | "SYMBOL";
export type NotificationLeadToneOutput = "NAVY" | "GOLD" | "GREEN" | "RED" | "GRAY" | "TEAL";
export type NotificationTypeOutput =
  | "POST_REACTION"
  | "BADGE_APPROVED"
  | "ENTERPRISE_APPROVED"
  | "ACCOUNT_BANNED"
  | "ACCOUNT_REMOVED"
  | "ENTERPRISE_COFUNDER"
  | "TERMS_UPDATED"
  | "MEMBERSHIP_VERIFIED"
  | "ENTERPRISE_REJECTED"
  | "ACCOUNT_RESTORED";

export type NotificationSegmentSummary = {
  text: string;
  href?: string;
  isBold?: boolean;
};

export type NotificationActionSummary = {
  label: string;
  href: string;
};

export type NotificationSummary = {
  id: string;
  type: NotificationTypeOutput;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  timeLabelOverride: string | null;
  lead: {
    kind: NotificationLeadKindOutput;
    value: string;
    tone: NotificationLeadToneOutput;
  };
  body: NotificationSegmentSummary[];
  action: NotificationActionSummary | null;
};

export type ListNotificationsOutput = {
  notifications: NotificationSummary[];
  unreadCount: number;
};

export type MarkNotificationAsReadOutput = {
  notification: NotificationSummary;
};

export type MarkAllNotificationsAsReadOutput = {
  updatedCount: number;
};