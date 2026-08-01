"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { getOrganizationsAdmin } from "@/src/lib/actions/api/organizations/organizations-actions";
import { getSales } from "@/src/lib/actions/api/sales/sales-actions";
import { getGradeCounts } from "@/src/lib/actions/api/students/student-actions";
import { getPosts } from "@/src/lib/actions/api/news/news-actions";
import { Grades, NewsItem, Organization, Sale } from "@/src/lib/types";

type GradeCount = { grade: number; count: number };

export default function DashboardPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [gradeCounts, setGradeCounts] = useState<GradeCount[]>([]);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const load = async () => {
      try {
        const [orgData, salesData, gradeData, newsData] = await Promise.all([
          getOrganizationsAdmin(),
          getSales(0),
          getGradeCounts(),
          getPosts(),
        ]);
        setOrgs(orgData?.organizations ?? []);
        setSales(salesData?.sales ?? []);
        setGradeCounts(gradeData?.grades ?? []);
        setNews(newsData?.items ?? []);
      } catch (e) {
        setError(e as Error);
      }
    };
    load();
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Overview of inventory and activity.</p>

      {error && (
        <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error.message}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Section title="News" moreHref="/authenticated/news-edit">
          <ul className="divide-y">
            {news.slice(0, 5).map((n) => (
              <li key={n.id} className="p-2 text-sm">
                <div className="font-medium">{n.title}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(n.publishedAt).toLocaleDateString()}
                </div>
              </li>
            ))}
            {news.length === 0 && <Empty label="No news yet." />}
          </ul>
        </Section>

        <Section title="Organizations" moreHref="/authenticated/organizations">
          <ul className="divide-y">
            {orgs.slice(0, 5).map((o) => (
              <li key={o.id} className="p-2 text-sm">
                <Link href={`/authenticated/organizations/${o.id}`} className="font-medium hover:underline">
                  {o.name}
                </Link>
                <div className="text-xs text-muted-foreground">{o.subject}</div>
              </li>
            ))}
            {orgs.length === 0 && <Empty label="No organizations yet." />}
          </ul>
        </Section>

        <Section title="Latest sales" moreHref="/authenticated/sales-index">
          <ul className="divide-y">
            {sales.slice(0, 5).map((s) => (
              <li key={s.id} className="p-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs">{s.id.slice(0, 8)}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(s.soldAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {s.items
                    .map((i) => `${i.booksCount} books / ${i.codesCount} codes — ${i.org?.name ?? i.orgId.slice(0, 8)}`)
                    .join(", ")}
                </div>
              </li>
            ))}
            {sales.length === 0 && <Empty label="No sales yet." />}
          </ul>
        </Section>

        <Section title="Grades with 10+ students" moreHref="/authenticated/students">
          <ul className="divide-y">
            {gradeCounts.map((g) => (
              <li key={g.grade} className="flex items-center justify-between p-2 text-sm">
                <Link
                  href={`/authenticated/students?grade=${g.grade}`}
                  className="font-medium hover:underline"
                >
                  {Grades[g.grade as keyof typeof Grades] ?? `Grade ${g.grade}`}
                </Link>
                <span className="text-muted-foreground">{g.count} students</span>
              </li>
            ))}
            {gradeCounts.length === 0 && <Empty label="No grade has more than 10 students yet." />}
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  moreHref,
  children,
}: {
  title: string;
  moreHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Link href={moreHref} className="text-xs text-primary hover:underline">
          More details
        </Link>
      </div>
      {children}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <li className="p-4 text-center text-sm text-muted-foreground">{label}</li>;
}
