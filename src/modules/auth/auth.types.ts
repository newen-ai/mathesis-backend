export const roles = ["user", "admin"] as const;
export type Role = (typeof roles)[number];

export type User = {
  id: string;
  email: string;
  canonicalEmail: string;
  passwordHash: string;
  authSessionVersion: number;
  role: Role;
};

export type AuthPayload = {
  sub: string;
  email: string;
  role: Role;
  authSessionVersion: number;
};

export type SessionUser = {
  id: string;
  email: string;
  role: Role;
  isWhitelisted: boolean;
};

export type SessionOutput = {
  sessionActive: boolean;
  user: SessionUser;
};
