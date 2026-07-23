import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";



type Student = {
  id: string;
  org_id: string;
  name: string;
  student_number: string;
  grade: string;
  school: string;
};
type Org = { id: string; name: string };

export default function StudentsPage() {
  // const qc = useQueryClient();
  // const students = useQuery({
  //   queryKey: ["students"],
  //   queryFn: () => api<{ students: Student[] }>("/api/students"),
  //   retry: false,
  // });
  // const orgs = useQuery({
  //   queryKey: ["organizations"],
  //   queryFn: () => api<{ organizations: Org[] }>("/api/organizations"),
  //   retry: false,
  // });

  const [form, setForm] = useState({
    org_id: "",
    name: "",
    student_number: "",
    grade: "",
    school: "",
  });

  // const create = useMutation({
  //   mutationFn: () =>
  //     api("/api/students", { method: "POST", body: JSON.stringify(form) }),
  //   onSuccess: () => {
  //     setForm({ org_id: "", name: "", student_number: "", grade: "", school: "" });
  //     qc.invalidateQueries({ queryKey: ["students"] });
  //   },
  // });

  // const remove = useMutation({
  //   mutationFn: (id: string) => api(`/api/students/${id}`, { method: "DELETE" }),
  //   onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  // });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">Students</h1>
      <p className="text-sm text-muted-foreground">Students associated with organizations.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
         // create.mutate();
        }}
        className="mt-6 grid grid-cols-2 gap-2 rounded-lg border bg-card p-3 sm:grid-cols-6"
      >
        <select
          required
          value={form.org_id}
          onChange={(e) => setForm({ ...form, org_id: e.target.value })}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="">Org…</option>
          {/* {orgs.data?.organizations?.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))} */}
        </select>
        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        />
        <input
          required
          placeholder="Number"
          value={form.student_number}
          onChange={(e) => setForm({ ...form, student_number: e.target.value })}
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
          placeholder="School"
          value={form.school}
          onChange={(e) => setForm({ ...form, school: e.target.value })}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        />
        <button className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Add
        </button>
      </form>

      {/* {(students.error || create.error) && (
        <p className="mt-2 text-sm text-destructive">
          {(students.error as Error)?.message ?? (create.error as Error)?.message}
        </p>
      )} */}

      <div className="mt-6 overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Number</th>
              <th className="p-2">Grade</th>
              <th className="p-2">School</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {/* {(students.data?.students ?? []).map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2 font-medium">{s.name}</td>
                <td className="p-2">{s.student_number}</td>
                <td className="p-2">{s.grade}</td>
                <td className="p-2">{s.school}</td>
                <td className="p-2 text-right">
                  <button
                 //   onClick={() => remove.mutate(s.id)}
                    className="text-xs text-destructive hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))} */}
            {/* {students.data && students.data.students?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-muted-foreground">
                  No students yet.
                </td>
              </tr>
            )} */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
