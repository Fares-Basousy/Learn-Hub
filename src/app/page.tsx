'use client'
import Image from "next/image";
import { useEffect, useState } from "react";
import { HeroFader } from "@/components/hero-fader";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NewsSection } from "@/components/news-section";
import { orgSections, shortcuts } from "@/content/landing";
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
import { TimetableEntry } from "../lib/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CLASSROOMS = ["Classroom 1", "Classroom 2", "Classroom 3"];
const SESSIONS = [0, 1, 2, 3];
const GRADES = ["Grade 7 Boys", "Grade 8 Girls", "Grade 9 Boys", "Grade 10 Girls"];

// Per-classroom session times — each classroom can start/end at different times.
const ROOM_TIMES: { start: string; end: string }[][] = [
  [
    { start: "8 AM", end: "10 AM" },
    { start: "10 AM", end: "12 PM" },
    { start: "2 PM", end: "4 PM" },
    { start: "4 PM", end: "6 PM" },
  ],
  [
    { start: "9 AM", end: "11 AM" },
    { start: "11 AM", end: "1 PM" },
    { start: "3 PM", end: "5 PM" },
    { start: "5 PM", end: "7 PM" },
  ],
  [
    { start: "10 AM", end: "12 PM" },
    { start: "12 PM", end: "2 PM" },
    { start: "4 PM", end: "6 PM" },
    { start: "6 PM", end: "8 PM" },
  ],
];

// Placeholder entries used when the DB isn't wired yet.
const PLACEHOLDER: TimetableEntry[] = CLASSROOMS.flatMap((c, ci) =>
  [1, 2, 3, 4].flatMap((d) =>
    SESSIONS.map((s) => ({
      id: `${c}-${d}-${s}`,
      classroom: c,
      day_of_week: d,
      session_index: s,
      start_time: ROOM_TIMES[ci][s].start,
      end_time: ROOM_TIMES[ci][s].end,
      grade: GRADES[s % GRADES.length],
      course: ["Math", "Science", "Arabic", "English"][(ci + s) % 4],
      teacher_name: ["Mr. Ahmed", "Ms. Layla", "Mr. Omar", "Ms. Fatima"][(ci + d) % 4],
      teacher_school: ["Al-Noor", "Bright Future", "Cedar High"][ci],
    })),
  ),
);
export default function Home() {
  const [selectedDay, setSelectedDay] = useState(1);
  const { lang, t, tm } = useLang();
  const [timetables,setTimetables] = useState<TimetableEntry[]>([])
  useEffect(()=>{
    const intialLoad = async ()=>{
    const  data  = await getTimetableEntries()
    const entries = data?.entries?.length ? data.entries : PLACEHOLDER;
    setTimetables(entries)
    }
    intialLoad()
  
  
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
          <div className="space-y-6">
            {orgSections.map((o, i) => (
              <article
                key={o.id}
                className={`grid gap-6 overflow-hidden rounded-2xl border bg-card md:grid-cols-2 ${
                  i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={o.image}
                    alt={lang === "ar" ? o.name_ar ?? o.name : o.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center p-6">
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {lang === "ar" ? o.subject_ar ?? o.subject : o.subject}
                  </div>
                  <h3 className="mt-2 text-xl font-bold">
                    {lang === "ar" ? o.name_ar ?? o.name : o.name}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {lang === "ar" ? o.description_ar ?? o.description : o.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
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
  const byKey = new Map(
    entries.map((e) => [`${e.classroom}-${e.day_of_week}-${e.session_index}`, e]),
  );

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-xs">
          <thead>
            <tr className="border-b bg-muted/30">
              {CLASSROOMS.map((room, i) => (
                <th key={room} className="p-3 text-start font-medium text-muted-foreground">
                  {t("classroom")} {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SESSIONS.map((s) => (
              <tr key={s} className="border-b last:border-0">
                {CLASSROOMS.map((room) => {
                  const e = byKey.get(`${room}-${day}-${s}`);
                  return (
                    <td key={room} className="p-3 align-top">
                      {e ? (
                        <div className="space-y-0.5">
                          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            {e.start_time} – {e.end_time}
                          </div>
                          <div className="font-semibold">{tm("courses", e.course)}</div>
                          <div className="text-muted-foreground">{e.teacher_name}</div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {tm("grades", e.grade)} · {e.teacher_school}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
