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
  day_of_week: number;
  session_index: number;
  start_time?: string;
  end_time?: string;
  grade: string;
  course: string;
  teacher_name: string;
  teacher_school: string;
};

export type NewsItem = {
  id: string;
  title: string;
  title_ar?: string | null;
  body?: string | null;
  body_ar?: string | null;
  image_url?: string | null;
  link_url?: string | null;
  link_label?: string | null;
  link_label_ar?: string | null;
  published_at: string; // ISO
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