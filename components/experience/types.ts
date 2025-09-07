import type { ReactNode } from "react";

export interface ExperienceItem {
  id: string;
  companyName: string;
  companyLogoSrc: string;
  companyDescription: string | ReactNode;
  startDate: string;
  endDate: string;
  roleDescription: string | ReactNode;
  companyUrl: string;
  location?: string;
}
