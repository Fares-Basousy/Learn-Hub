'use client'
import Image from "next/image";
import { useEffect, useState } from "react";
import { HeroFader } from "@/components/hero-fader";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NewsSection } from "@/components/news-section";
import { shortcuts } from "@/content/landing";
import { api } from "@/lib/api";
import { useLang } from "@/components/lang-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTimetableEntries } from "../lib/actions/api/timetable/timetable-actions";
import { getPublicOrganizations } from "../lib/actions/api/organizations/organizations-actions";
import { TimetableEntry } from "../lib/types";
import { CLASSROOMS, formatMinutes } from "../lib/timetable";

type PublicOrganization = { id: string; name: string; subject: string; picUrl: string };

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SESSIONS = [0, 1, 2, 3];

// Placeholder entries used when the DB isn't wired yet.
const PLACEHOLDER: TimetableEntry[] = CLASSROOMS.flatMap((c, ci) =>
  [1, 2, 3, 4].flatMap((d) =>
    SESSIONS.map((s) => {
      const start = 480 + s * 150 + ci * 30;
      return {
        id: `${c}-${d}-${s}`,
        classroom: c,
        dayOfWeek: d,
        startMinute: start,
        endMinute: start + 120,
        grade: ((s % 12) + 1),
        course: ["Math", "Science", "Arabic", "English"][(ci + s) % 4],
        teacherName: ["Mr. Ahmed", "Ms. Layla", "Mr. Omar", "Ms. Fatima"][(ci + d) % 4],
        teacherSchool: ["Al-Noor", "Bright Future", "Cedar High"][ci],
      };
    }),
  ),
);
export default function Home() {
  const [selectedDay, setSelectedDay] = useState(1);
  const { lang, t, tm } = useLang();
  const [timetables,setTimetables] = useState<TimetableEntry[]>([])
  const [organizations, setOrganizations] = useState<PublicOrganization[]>([])
  useEffect(()=>{
    const intialLoad = async ()=>{
    const  data  = await getTimetableEntries()
    const entries = data?.entries?.length ? data.entries : PLACEHOLDER;
    setTimetables(entries)
    }
    intialLoad()


  },[])

  useEffect(()=>{
    const loadOrgs = async ()=>{
      const data = await getPublicOrganizations()
      setOrganizations(data?.organizations ?? [])
    }
    loadOrgs()
  },[])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <NewsSection />
        <HeroFader />

        <section id="shortcuts" className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("quickLinks")}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {shortcuts.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="rounded-lg border bg-card p-4 transition-colors hover:border-primary hover:bg-accent"
              >
                <div className="font-semibold">
                  {lang === "ar" ? s.label_ar ?? s.label : s.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {lang === "ar" ? s.description_ar ?? s.description : s.description}
                </div>
              </a>
            ))}
          </div>
        </section>

        <section id="timetable" className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">{t("timetable")}</h2>
              <p className="text-sm text-muted-foreground">{t("timetableSubtitle")}</p>
            </div>
            <Select
              value={String(selectedDay)}
              onValueChange={(v) => setSelectedDay(Number(v))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("selectDay")} />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((_d, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {tm("days", i)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <TimetableGrid day={selectedDay} entries={timetables} />
        </section>

        <section id="organizations" className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="mb-6 text-2xl font-bold">{t("partners")}</h2>
          {organizations.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noOrganizationsYet")}</p>
          ) : (
            <div className="space-y-6">
              {organizations.map((o, i) => (
                <article
                  key={o.id}
                  className={`grid gap-6 overflow-hidden rounded-2xl border bg-card md:grid-cols-2 ${
                    i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
                  }`}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={o.picUrl}
                      alt={o.name}
                      className="washed h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-6">
                    <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {o.subject}
                    </div>
                    <h3 className="mt-2 text-xl font-bold">{o.name}</h3>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function TimetableGrid({
  day,
  entries,
}: {
  day: number;
  entries: TimetableEntry[];
}) {
  const { t, tm } = useLang();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {CLASSROOMS.map((room, i) => {
        const roomEntries = entries
          .filter((e) => e.classroom === room && e.dayOfWeek === day)
          .sort((a, b) => a.startMinute - b.startMinute);

        return (
          <div key={room} className="overflow-hidden rounded-xl border bg-card">
            <div className="border-b bg-muted/30 p-3 text-sm font-medium text-muted-foreground">
              {t("classroom")} {i + 1}
            </div>
            <div className="divide-y">
              {roomEntries.length === 0 && (
                <div className="p-3 text-xs text-muted-foreground/50">—</div>
              )}
              {roomEntries.map((e) => (
                <div key={e.id} className="space-y-0.5 p-3">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {formatMinutes(e.startMinute)} – {formatMinutes(e.endMinute)}
                  </div>
                  <div className="font-semibold">{tm("courses", e.course)}</div>
                  <div className="text-muted-foreground">{e.teacherName}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {tm("grades", e.grade)} · {e.teacherSchool}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
