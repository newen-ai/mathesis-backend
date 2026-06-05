import type { Profile, User, WorkExperience } from "@prisma/client";

export type ProfileWithWorkExperiences = Pick<
  Profile,
  "firstName" | "lastName" | "dateOfBirth" | "nationality" | "currentJobTitle" | "currentCompany"
> & {
  workExperiences: Array<Pick<WorkExperience, "company" | "jobTitle" | "startDate" | "endDate">>;
};

export type EmploymentHistoryOutput = {
  company: string;
  jobTitle: string;
  startYearMonth: string;
  endYearMonth: string | null;
};

export type ProfileOutput = {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  nationality: string | null;
  currentJobTitle: string | null;
  currentCompany: string | null;
  employmentHistory: EmploymentHistoryOutput[];
};

export type MyProfileOutput = {
  id: string;
  email: string;
  role: User["role"];
  profile: ProfileOutput | null;
};
