export const roles = ["user", "admin"] as const;
export type Role = (typeof roles)[number];

export type User = {
  id: string;
  email: string;
  canonicalEmail: string;
  passwordHash: string;
  role: Role;
};

export type AuthPayload = {
  sub: string;
  email: string;
  role: Role;
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
