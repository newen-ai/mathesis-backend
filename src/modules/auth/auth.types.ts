import type { Profile, WorkExperience } from "@prisma/client";

export const roles = ["user", "admin"] as const;
export type Role = (typeof roles)[number];

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
};

export type AuthPayload = {
  sub: string;
  email: string;
  role: Role;
};

export type ProfileWithWorkExperiences = Pick<
  Profile,
  "firstName" | "lastName" | "dateOfBirth" | "nationality" | "currentJobTitle" | "currentCompany"
> & {
  workExperiences: Array<Pick<WorkExperience, "company" | "jobTitle" | "startDate" | "endDate">>;
};
