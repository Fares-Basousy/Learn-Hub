// Placeholder news items shown if the news table is empty or unreachable.
// The `/authenticated/news-edit` page (behind login) creates/updates/deletes real items.

import { NewsItem } from "../lib/types";

export const newsItems: NewsItem[] = [
  {
    id: "n1",
    title: "Fall term registration is now open",
    body: "Secure your seat for the upcoming term across all partner schools.",
    imageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&q=80",
    linkUrl: "#organizations",
    linkLabel: "Learn more",
    publishedAt: "2026-06-20T09:00:00Z",
  },
];
