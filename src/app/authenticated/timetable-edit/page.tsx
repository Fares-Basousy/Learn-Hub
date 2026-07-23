/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { createTimeTable, deleteTimeTable, getTimetableEntries, updateTimeTable } from "@/src/lib/actions/api/timetable/timetable-actions";
import { time } from "console";


type Entry = {
  id: number;
  classroom: string;
  day_of_week: number;
  session_index: number;
  grade: string;
  course: string;
  teacher_name: string;
  teacher_school: string;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TimetableEditPage() {

  const [timetables, setTimetables] = useState<Entry[]>([])
  const [error, setError] =useState()
  useEffect(()=>{
    const intialLoad = async ()=>{
        const  data  = await getTimetableEntries()
        const parsedData = await data.json() 
        const entries = parsedData?.entries?.length ? parsedData.entries : [];
        setTimetables(entries)
        }
        intialLoad()
  })

  const [form, setForm] = useState<Omit<Entry, "id">>({
    classroom: "Classroom 1",
    day_of_week: 1,
    session_index: 0,
    grade: "",
    course: "",
    teacher_name: "",
    teacher_school: "",
  });

  const create =async ()=>{
    try{
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
      formData.append(key, String(value));
      });
      await createTimeTable(formData)}
    catch(error : any){
      console.log(error)
      setError(error.message)

  }
  } 
  const remove = async (id : number)=>{
    try{
      await deleteTimeTable(id)}
    catch(error : unknown){
      console.log(error)
    } 
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">Timetable</h1>
      <p className="text-sm text-muted-foreground">
        Sessions shown on the public landing page.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          create()
        }}
        className="mt-6 grid grid-cols-2 gap-2 rounded-lg border bg-card p-3 sm:grid-cols-4 lg:grid-cols-8"
      >
        <select
          value={form.classroom}
          onChange={(e) => setForm({ ...form, classroom: e.target.value })}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          {["Classroom 1", "Classroom 2", "Classroom 3"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={form.day_of_week}
          onChange={(e) => setForm({ ...form, day_of_week: Number(e.target.value) })}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          {DAYS.map((d, i) => (
            <option key={d} value={i}>
              {d}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          value={form.session_index}
          onChange={(e) => setForm({ ...form, session_index: Number(e.target.value) })}
          placeholder="Session"
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        />
        <input
          required
          placeholder="Grade"
          value={form.grade}
          onChange={(e) => setForm({ ...form, grade: e.target.value })}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        />
        <input
          required
          placeholder="Course"
          value={form.course}
          onChange={(e) => setForm({ ...form, course: e.target.value })}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        />
        <input
          required
          placeholder="Teacher"
          value={form.teacher_name}
          onChange={(e) => setForm({ ...form, teacher_name: e.target.value })}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        />
        <input
          required
          placeholder="Teacher's school"
          value={form.teacher_school}
          onChange={(e) => setForm({ ...form, teacher_school: e.target.value })}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        />
        <button className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Add
        </button>
      </form>

      {(error? (
        <p className="mt-2 text-sm text-destructive">
          {(error as any)?.message}
        </p>
      ):null)}

      <div className="mt-6 overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-2">Classroom</th>
              <th className="p-2">Day</th>
              <th className="p-2">Session</th>
              <th className="p-2">Grade</th>
              <th className="p-2">Course</th>
              <th className="p-2">Teacher</th>
              <th className="p-2">Teacher&apos;s school</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {(timetables ?? []).map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-2">{e.classroom}</td>
                <td className="p-2">{DAYS[e.day_of_week]}</td>
                <td className="p-2">{e.session_index + 1}</td>
                <td className="p-2">{e.grade}</td>
                <td className="p-2">{e.course}</td>
                <td className="p-2">{e.teacher_name}</td>
                <td className="p-2">{e.teacher_school}</td>
                <td className="p-2 text-right">
                  <button
                    onClick={()=>{remove(e.id)}}
                    className="text-xs text-destructive hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {timetables?.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-muted-foreground">
                  No entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
