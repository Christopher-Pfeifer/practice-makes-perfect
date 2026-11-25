export type UserRole =
  | "Studio"
  | "Teacher"
  | "Student"
  | "Parent"
  | "Admin"
  | "Unassigned";

export interface UserProfile {
  username: string;
  fullName: string;
  role: UserRole;
}

export interface TeacherDetailUI {
  instruments: string;
  bio: string;
  yearsExperience: string;
  certifications: string;
  notes: string;
  studioName: string;
}

export interface StudioDetailUI {
  website: string;
  licenseNumber: string;
  description: string;
  notes: string;
}

export interface StudentDetailUI {
  instrument: string;
  voiceType: string;
  skillLevel: string;
  theoryLevel: string;
  ensembleParticipation: string;
  practiceGoals: string;
  notes: string;
  studioName: string;
}

export interface ParentDetailUI {
  notes: string;
}
