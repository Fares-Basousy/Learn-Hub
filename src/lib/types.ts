export const Grades = {
  1 : "1st Elementary",
  2 : "2nd Elementary",
  3 : "3rd Elementary",
  4 : "4th Elementary",
  5 : "5th Elementary",
  6 : "6th Elementary",
  7 : "1st Middle",
  8 : "2nd Middle",
  9 : "3rd Middle",
  10 : "1st Senior",
  11 : "2nd Senior",
  12 : "3rd Senior",
}

export const Courses = [
  "Biology",
  "Chemistry",
  "Math",
  "Physics",
  "Geography",
  "Statistics",
  "Economics",
  "History",
  "Programming",
  "Psychiatry",
  "Business",
  "Accounting",
  "Integrated Sciences",
  "Philosophy",
  "Religion",
  "Second Language",
  "Social Studies",
] as const;

export type Gender = "MALE" | "FEMALE";

export type OrganizationInventory = {
  id: string;
  orgId: string;
  grade: number;
  booksCount: number;
  codesCount: number;
};

export type Organization = {
  id: string;
  name: string;
  subject: string;
  picUrl: string;
  inventory?: OrganizationInventory[];
  createdAt?: Date;
};

export type Student = {
  id: string;
  orgId: string;
  name: string;
  number: string;
  grade: number;
  school: string;
  type?: string | null;
  gender: Gender;
};


export type  TimetableEntry = {
  id: string;
  classroom: string;
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  grade: number;
  course: string;
  teacherName: string;
  teacherSchool: string;
};

export type NewsItem = {
  id: string;
  title: string;
  body?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  linkLabel?: string | null;
  publishedAt: string; // ISO
};


export type SaleItem = {
  id: string;
  saleId: string;
  orgId: string;
  org?: Organization;
  grade: number;
  booksCount: number;
  codesCount: number;
};

export type Sale = {
  id: string;
  userId: string;
  items: SaleItem[];
  soldAt: Date;
};



export type User = {
  id: string;
  username: string;
  password_hash: string;
  created_at: string; // ISO timestamp
};