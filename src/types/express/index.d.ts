import type { Role } from "../../modules/auth/auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email: string;
        role: Role;
      };
    }
  }
}

export {};
