import type { Profile, User, WorkExperience } from "@prisma/client";

export type ProfileWithWorkExperiences = Pick<
  Profile,
  "firstName" | "lastName" | "dateOfBirth" | "nationality" | "currentJobTitle" | "currentCompany"
> & {
  workExperiences: Array<Pick<WorkExperience, "id" | "company" | "jobTitle" | "startDate" | "endDate">>;
};

export type EmploymentHistoryOutput = {
  id: string;
  company: string;
  jobTitle: string;
  startYearMonth: string;
  endYearMonth: string | null;
};

export type AddWorkExperienceOperationInput = {
  action: "ADD";
  company: string;
  jobTitle: string;
  startYearMonth: string;
  endYearMonth?: string;
};

export type EditWorkExperienceOperationInput = {
  action: "EDIT";
  id: string;
  company?: string;
  jobTitle?: string;
  startYearMonth?: string;
  endYearMonth?: string;
};

export type RemoveWorkExperienceOperationInput = {
  action: "REMOVE";
  id: string;
};

export type WorkExperienceOperationInput =
  | AddWorkExperienceOperationInput
  | EditWorkExperienceOperationInput
  | RemoveWorkExperienceOperationInput;

export type ProfileOutput = {
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
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
