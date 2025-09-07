import type { ReactNode } from "react";

export interface ProjectItem {
  id: string;
  name: string;
  description: string | ReactNode;
  tech: string[];
  startDate: string;
  endDate?: string;
  logoSrc?: string;
  linkUrl?: string;
}


