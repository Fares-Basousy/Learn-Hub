// Placeholder news items shown when the DB isn't wired yet.
// The `/news/edit` page (behind login) can create/update/delete real items.

import { NewsItem } from "../lib/types";

export const newsItems: NewsItem[] = [
  {
    id: "n1",
    title: "Fall term registration is now open",
    title_ar: "التسجيل للفصل الخريفي مفتوح الآن",
    body: "Secure your seat for the upcoming term across all partner schools.",
    body_ar: "احجز مقعدك للفصل الدراسي القادم في جميع المدارس الشريكة.",
    image_url:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&q=80",
    link_url: "#organizations",
    link_label: "Learn more",
    link_label_ar: "اعرف المزيد",
    published_at: "2026-06-20T09:00:00Z",
  },
];
