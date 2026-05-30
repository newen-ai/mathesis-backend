import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { env } from "../../config/env";
import { AppError } from "../../common/errors/app-error";
import type { AuthPayload, User } from "./auth.types";

const users = new Map<string, User>();

const buildAccessToken = (payload: AuthPayload): string => {
  const expiresIn = env.JWT_ACCESS_TTL as jwt.SignOptions["expiresIn"];
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn });
};

const sanitizeUser = (user: User) => ({
  id: user.id,
  email: user.email,
  role: user.role
});

export const authService = {
  async register(email: string, password: string): Promise<{ accessToken: string; user: object }> {
    if (users.has(email)) {
      throw new AppError("Email is already registered", StatusCodes.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      role: "user"
    };

    users.set(email, newUser);

    const payload: AuthPayload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role
    };

    return {
      accessToken: buildAccessToken(payload),
      user: sanitizeUser(newUser)
    };
  },

  async login(email: string, password: string): Promise<{ accessToken: string; user: object }> {
    const user = users.get(email);
    if (!user) {
      throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
    }

    const payload: AuthPayload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    return {
      accessToken: buildAccessToken(payload),
      user: sanitizeUser(user)
    };
  },

  verifyToken(token: string): AuthPayload {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
    } catch {
      throw new AppError("Invalid or expired token", StatusCodes.UNAUTHORIZED);
    }
  }
};
