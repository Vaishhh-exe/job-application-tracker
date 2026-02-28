// types/application.ts
export type ApplicationStatus =
  | "applied"
  | "interview"
  | "offer"
  | "rejected"
  | "ghosted";

export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface Application {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedDate: string;
  notes?: string | null;
  recruiterName?: string | null;
  jobUrl?: string | null;
  salary?: number | null;
  currency?: string | null;
  followUpDate?: string | null;
  priority: Priority;
  tags: string[];
  userId: string;
}

export type NewApplication = Omit<Application, "id">;