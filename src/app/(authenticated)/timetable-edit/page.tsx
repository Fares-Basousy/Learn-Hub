/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createTimeTable,
  deleteTimeTable,
  getTimetableEntries,
  updateTimeTable,
} from "@/src/lib/actions/api/timetable/timetable-actions";
import { TimetableEntry, Grades, Courses } from "@/src/lib/types";
import {
  CLASSROOMS,
  MIN_DURATION_MINUTES,
  durationOptions,
  formatMinutes,
  startTimeOptions,
} from "@/lib/timetable";
import { useLang } from "@/components/lang-provider";
import { PageLoader } from "@/components/spinner";

const DAY_INDICES = [0, 1, 2, 3, 4, 5, 6];
const OTHER_COURSE = "__other__";

type FormState = {
  classroom: string;
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  grade: number;
  course: string;
  teacherName: string;
  teacherSchool: string;
};

function emptyForm(classroom: string, dayOfWeek: number): FormState {
  const start = startTimeOptions()[0];
  return {
    classroom,
    dayOfWeek,
    startMinute: start,
    endMinute: start + MIN_DURATION_MINUTES,
    grade: 1,
    course: Courses[0],
    teacherName: "",
    teacherSchool: "",
  };
}

export default function TimetableEditPage() {
  const { t, tm } = useLang();
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [selectedClassroom, setSelectedClassroom] = useState(CLASSROOMS[0]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(CLASSROOMS[0], new Date().getDay()));
  const [courseIsOther, setCourseIsOther] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getTimetableEntries();
        const entries = data?.entries?.length ? data.entries : [];
        setTimetables(entries);
      } catch (e: any) {
        toast.error(e.message ?? t("failedToLoadTimetable"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshKey]);

  const dayEntries = timetables
    .filter((e) => e.classroom === selectedClassroom && e.dayOfWeek === selectedDay)
    .sort((a, b) => a.startMinute - b.startMinute);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm(selectedClassroom, selectedDay));
    setCourseIsOther(false);
    setFormOpen(true);
  };

  const openEditForm = (entry: TimetableEntry) => {
    setEditingId(entry.id);
    setForm({
      classroom: entry.classroom,
      dayOfWeek: entry.dayOfWeek,
      startMinute: entry.startMinute,
      endMinute: entry.endMinute,
      grade: entry.grade,
      course: entry.course,
      teacherName: entry.teacherName,
      teacherSchool: entry.teacherSchool,
    });
    setCourseIsOther(!(Courses as readonly string[]).includes(entry.course));
    setFormOpen(true);
  };

  const submit = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    try {
      if (editingId) {
        await toast.promise(updateTimeTable(formData, editingId), {
          loading: t("savingEntry"),
          success: t("entryUpdated"),
          error: (e: any) => e.message ?? t("failedToUpdateEntry"),
        });
      } else {
        await toast.promise(createTimeTable(formData), {
          loading: t("addingEntry"),
          success: t("entryAdded"),
          error: (e: any) => e.message ?? t("failedToAddEntry"),
        });
      }
      setFormOpen(false);
      setEditingId(null);
      setRefreshKey(Math.random());
    } catch (error: any) {
      console.log(error);
    }
  };

  const remove = async (id: string) => {
    try {
      await toast.promise(deleteTimeTable(id), {
        loading: t("deletingEntry"),
        success: t("entryDeleted"),
        error: (e: any) => e.message ?? t("failedToDeleteEntry"),
      });
      setRefreshKey(Math.random());
    } catch (error: unknown) {
      console.log(error);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">{t("timetable")}</h1>
      <p className="text-sm text-muted-foreground">
        {t("timetableAdminSubtitle")}
      </p>

      <div className="mt-6 -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {DAY_INDICES.map((i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
              selectedDay === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {tm("days", i)}
          </button>
        ))}
      </div>

      <div className="mt-2 flex gap-1">
        {CLASSROOMS.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedClassroom(c)}
            className={`flex-1 rounded-md px-2 py-1.5 text-sm font-medium ${
              selectedClassroom === c
                ? "bg-secondary text-secondary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <button
        onClick={() => (formOpen ? setFormOpen(false) : openAddForm())}
        className="mt-4 h-9 w-full rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        {formOpen ? t("cancel") : t("addEntry")}
      </button>

      {formOpen && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="mt-3 grid grid-cols-2 gap-2 rounded-lg border bg-card p-3"
        >
          <select
            value={form.classroom}
            onChange={(e) => setForm({ ...form, classroom: e.target.value })}
            className="h-9 rounded-full border border-input bg-background px-3 text-sm"
          >
            {CLASSROOMS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            value={form.dayOfWeek}
            onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })}
            className="h-9 rounded-full border border-input bg-background px-3 text-sm"
          >
            {DAY_INDICES.map((i) => (
              <option key={i} value={i}>
                {tm("days", i)}
              </option>
            ))}
          </select>
          <select
            value={form.startMinute}
            onChange={(e) => {
              const startMinute = Number(e.target.value);
              const duration = form.endMinute - form.startMinute;
              setForm({
                ...form,
                startMinute,
                endMinute: startMinute + Math.max(duration, MIN_DURATION_MINUTES),
              });
            }}
            className="h-9 rounded-full border border-input bg-background px-3 text-sm"
          >
            {startTimeOptions().map((m) => (
              <option key={m} value={m}>
                {formatMinutes(m)}
              </option>
            ))}
          </select>
          <select
            value={form.endMinute - form.startMinute}
            onChange={(e) =>
              setForm({ ...form, endMinute: form.startMinute + Number(e.target.value) })
            }
            className="h-9 rounded-full border border-input bg-background px-3 text-sm"
          >
            {durationOptions(form.startMinute).map((d) => (
              <option key={d} value={d}>
                {d / 60}{t("hourAbbrev")}{d % 60 ? ` ${d % 60}${t("minuteAbbrev")}` : ""}
              </option>
            ))}
          </select>
          <select
            value={form.grade}
            onChange={(e) => setForm({ ...form, grade: Number(e.target.value) })}
            className="h-9 rounded-full border border-input bg-background px-3 text-sm"
          >
            {Object.entries(Grades).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={courseIsOther ? OTHER_COURSE : form.course}
            onChange={(e) => {
              if (e.target.value === OTHER_COURSE) {
                setCourseIsOther(true);
                setForm({ ...form, course: "" });
              } else {
                setCourseIsOther(false);
                setForm({ ...form, course: e.target.value });
              }
            }}
            className="h-9 rounded-full border border-input bg-background px-3 text-sm"
          >
            {Courses.map((c) => (
              <option key={c} value={c}>
                {tm("courses", c)}
              </option>
            ))}
            <option value={OTHER_COURSE}>{t("otherCourseOption")}</option>
          </select>
          {courseIsOther && (
            <input
              required
              placeholder={t("otherCoursePlaceholder")}
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              className="h-9 rounded-full border border-input bg-background px-3 text-sm"
            />
          )}
          <input
            required
            placeholder={t("teacherPlaceholder")}
            value={form.teacherName}
            onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
            className="h-9 rounded-full border border-input bg-background px-3 text-sm"
          />
          <input
            required
            placeholder={t("teacherSchoolPlaceholder")}
            value={form.teacherSchool}
            onChange={(e) => setForm({ ...form, teacherSchool: e.target.value })}
            className="h-9 rounded-full border border-input bg-background px-3 text-sm"
          />
          <button className="col-span-2 h-9 rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {editingId ? t("save") : t("add")}
          </button>
        </form>
      )}

      <div className="mt-4 space-y-2">
        {loading && <PageLoader />}
        {!loading && dayEntries.length === 0 && (
          <div className="rounded-lg border bg-card p-4 text-center text-sm text-muted-foreground">
            {t("noEntriesYet")}
          </div>
        )}
        {!loading && dayEntries.map((e) => (
          <div key={e.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {formatMinutes(e.startMinute)} – {formatMinutes(e.endMinute)}
                </div>
                <div className="font-semibold">{tm("courses", e.course)}</div>
                <div className="text-sm text-muted-foreground">
                  {e.teacherName} · {e.teacherSchool}
                </div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {Grades[e.grade as keyof typeof Grades] ?? e.grade}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => openEditForm(e)}
                  className="text-xs text-primary hover:underline"
                >
                  {t("edit")}
                </button>
                <button
                  onClick={() => remove(e.id)}
                  className="text-xs text-destructive hover:underline"
                >
                  {t("delete")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
