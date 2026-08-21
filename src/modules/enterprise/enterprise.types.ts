export type EnterpriseOutput = {
  id: string;
  name: string;
  role: string;
  website: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EnterpriseDirectoryOutput = {
  id: string;
  name: string;
  role: string;
  website: string | null;
  description: string | null;
  founder: string | null;
  location: string | null;
  badgeSlug: string;
  createdAt: string;
  updatedAt: string;
};
