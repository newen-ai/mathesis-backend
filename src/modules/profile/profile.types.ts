import type { EducationExperience, Profile, User, WorkExperience } from "@prisma/client";

export type ProfileWithWorkExperiences = Pick<
  Profile,
  | "firstName"
  | "lastName"
  | "dateOfBirth"
  | "nationality"
  | "currentJobTitle"
  | "currentCompany"
  | "about"
  | "locationCountry"
  | "locationCity"
  | "locationPostalCode"
  | "interests"
  | "profileImageUrl"
  | "profileBannerImageUrl"
> & {
  workExperiences: Array<
    Pick<WorkExperience, "id" | "company" | "jobTitle" | "description" | "startDate" | "endDate">
  >;
  educationExperiences: Array<
    Pick<
      EducationExperience,
      "id" | "institution" | "degree" | "fieldOfStudy" | "startDate" | "endDate" | "description"
    >
  >;
};

export type EmploymentHistoryOutput = {
  id: string;
  company: string;
  jobTitle: string;
  description: string | null;
  startYearMonth: string;
  endYearMonth: string | null;
};

export type EducationHistoryOutput = {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string | null;
  startYearMonth: string;
  endYearMonth: string | null;
  description: string | null;
};

export type BadgeOutput = {
  slug: string;
};

export type AddWorkExperienceOperationInput = {
  action: "ADD";
  company: string;
  jobTitle: string;
  description?: string;
  startYearMonth: string;
  endYearMonth?: string;
};

export type EditWorkExperienceOperationInput = {
  action: "EDIT";
  id: string;
  company?: string;
  jobTitle?: string;
  description?: string;
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

export type AddEducationExperienceOperationInput = {
  action: "ADD";
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYearMonth: string;
  endYearMonth?: string;
  description?: string;
};

export type EditEducationExperienceOperationInput = {
  action: "EDIT";
  id: string;
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  startYearMonth?: string;
  endYearMonth?: string;
  description?: string;
};

export type RemoveEducationExperienceOperationInput = {
  action: "REMOVE";
  id: string;
};

export type EducationExperienceOperationInput =
  | AddEducationExperienceOperationInput
  | EditEducationExperienceOperationInput
  | RemoveEducationExperienceOperationInput;

export type ProfileOutput = {
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  nationality: string | null;
  currentJobTitle: string | null;
  currentCompany: string | null;
  about: string | null;
  locationCountry: string | null;
  locationCity: string | null;
  locationPostalCode: string | null;
  interests: string[];
  profileImageUrl: string | null;
  profileBannerImageUrl: string | null;
  badges: BadgeOutput[];
  employmentHistory: EmploymentHistoryOutput[];
  educationHistory: EducationHistoryOutput[];
};

export type InterestSuggestionOutput = {
  value: string;
};

export type MyProfileOutput = {
  id: string;
  email: string;
  role: User["role"];
  profile: ProfileOutput | null;
};

export type UserSearchResult = {
  userId: string;
  firstName: string;
  lastName: string;
};
