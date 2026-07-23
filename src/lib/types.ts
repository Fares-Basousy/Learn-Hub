export type Organization = {
  id: string;
  name: string;
  subject: string;
  meta?: Record<string, unknown>;
  books_count: number;
  codes_count: number;
  created_at?: string;
};




export type Student = {
  id: string;
  org_id: string;
  name: string;
  student_number: string;
  grade: string;
  school: string;
};


export type  TimetableEntry = {
  id: string;
  classroom: string;
  day_of_week: number;
  session_index: number;
  start_time: string;
  end_time: string;
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
  type: "book" | "code" | "other";
  count: number;
};


export type Sale = {
  id: string;
  org_id: string;
  items: Array<{ type: string; count: number }>;
  sold_at: string;
};



export type User = {
  id: string;
  username: string;
  password_hash: string;
  created_at: string; // ISO timestamp
};