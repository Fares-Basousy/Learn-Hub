"use client"
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createStudent, getStudents } from "@/src/lib/actions/api/students/student-actions";
import { getOrganizationsAdmin } from "@/src/lib/actions/api/organizations/organizations-actions";
import { Gender, Organization, Student } from "@/src/lib/types";
import StudentRow from "@/src/components/student-row";

export default function StudentsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <StudentsPageWithFilters />
    </Suspense>
  );
}

// Reading the filter here and re-keying the inner component on it means the
// inner component's pageIndex/students state resets cleanly whenever the
// org/grade filter changes, without needing a setState-in-effect reset.
function StudentsPageWithFilters() {
  const searchParams = useSearchParams();
  const filterOrgId = searchParams.get("orgId") ?? undefined;
  const filterGradeParam = searchParams.get("grade");
  const filterGrade = filterGradeParam ? Number(filterGradeParam) : undefined;
  const filterKey = `${filterOrgId ?? ""}|${filterGrade ?? ""}`;

  return (
    <StudentsPageInner key={filterKey} filterOrgId={filterOrgId} filterGrade={filterGrade} />
  );
}

function StudentsPageInner({
  filterOrgId,
  filterGrade,
}: {
  filterOrgId?: string;
  filterGrade?: number;
}) {
  const [students, setStudents] = useState<Student[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<Error>()
  const [form, setForm] = useState({
    orgId: "",
    name: "",
    number: "",
    grade: "",
    school: "",
    gender: "MALE" as Gender,
    type: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const organizationsData = await getOrganizationsAdmin()
        setOrganizations(organizationsData.organizations)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (e: any) {
        setError(e)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const studentsData = await getStudents(pageIndex, { orgId: filterOrgId, grade: filterGrade })
        setStudents((prev) => (pageIndex === 0 ? studentsData.students : [...prev, ...studentsData.students]))
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (e: any) {
        setError(e)
      }
    }
    load()
  }, [pageIndex, filterOrgId, filterGrade])

  const create = async () => {
    try {
      setPending(true)
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, String(value));
      });
      await createStudent(formData).then(() => {
        setForm({ orgId: "", name: "", number: "", grade: "", school: "", gender: "MALE", type: "" })
        setPending(false)
        setPageIndex(0)
      })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
      console.log(error)
      setPending(false)
      setError(error.message)
    }
  }

  const filterOrg = organizations.find((o) => o.id === filterOrgId);
  const isFiltered = Boolean(filterOrgId || filterGrade);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">Students</h1>
      <p className="text-sm text-muted-foreground">Students associated with organizations.</p>

      {isFiltered && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-md border bg-accent/40 px-3 py-2 text-sm">
          <span>
            Filtered by
            {filterOrg && <> organization <strong>{filterOrg.name}</strong></>}
            {filterOrg && filterGrade !== undefined && " · "}
            {filterGrade !== undefined && <>grade <strong>{filterGrade}</strong></>}
          </span>
          <Link href="/authenticated/students" className="text-xs text-primary hover:underline">
            Clear filter
          </Link>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          create();
        }}
        className="mt-6 grid grid-cols-2 gap-2 rounded-lg border bg-card p-3 sm:grid-cols-4"
      >
        <select
          required
          value={form.orgId}
          onChange={(e) => setForm({ ...form, orgId: e.target.value })}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="">Org…</option>
          {organizations?.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
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
          value={form.number}
          onChange={(e) => setForm({ ...form, number: e.target.value })}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        />
        <input
          required
          type="number"
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
        <select
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </select>
        <input
          placeholder="Type (optional)"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        />
        <button
          disabled={pending}
          className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          Add
        </button>
      </form>

      {(error) && (
        <p className="mt-2 text-sm text-destructive">
          {(error as Error)?.message ?? (error as Error)?.message}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
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
              {(students ?? []).map((s) => (
                <StudentRow
                  key={s.id}
                  student={s}
                  onDelete={(id) => setStudents((prev) => prev.filter((student) => student.id !== id))}
                  onUpdate={(updated) =>
                    setStudents((prev) => prev.map((student) => (student.id === updated.id ? updated : student)))
                  }
                />
              ))}
              {students && students?.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    No students yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={() => setPageIndex((prev) => prev + 1)}
        className="mt-3 w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        Next
      </button>
    </div>
  );
}
