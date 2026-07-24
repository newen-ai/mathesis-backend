export const roles = ["user", "admin"] as const;
export type Role = (typeof roles)[number];

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  emailConfirmationTokenHash?: string | null;
  emailConfirmedAt?: Date | null;
};

export type AuthPayload = {
  sub: string;
  email: string;
  role: Role;
};
