"use client"
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { createStudent, getStudents } from "@/src/lib/actions/api/students/student-actions";
import { getOrganizationsAdmin } from "@/src/lib/actions/api/organizations/organizations-actions";
import { Gender, Grades, Organization, Student } from "@/src/lib/types";
import StudentRow from "@/src/components/student-row";
import { useLang } from "@/components/lang-provider";
import { PageLoader, Spinner } from "@/components/spinner";

export default function StudentsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <StudentsPageWithFilters />
    </Suspense>
  );
}

// Reading the filter here and re-keying the inner component on it means the
// inner component's students state resets cleanly whenever the org/grade
// filter changes, without needing a setState-in-effect reset.
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
  const { t, tm } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawPage = Number(searchParams.get("page"));
  // page is 0-indexed internally; an invalid/missing param falls back to the first page.
  const pageIndex = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 0;

  const [students, setStudents] = useState<Student[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [pending, setPending] = useState(false)
  const [tableLoading, setTableLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form, setForm] = useState({
    orgIds: [] as string[],
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
        toast.error(e.message ?? t("failedToLoadOrganizations"))
      }
    }
    load()
  }, [])

  useEffect(() => {
    const load = async () => {
      setTableLoading(true)
      try {
        const studentsData = await getStudents(pageIndex, { orgId: filterOrgId, grade: filterGrade })
        setStudents(studentsData.students)
        setHasMore(Boolean(studentsData.hasMore))
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (e: any) {
        toast.error(e.message ?? t("failedToLoadStudents"))
      }
      finally {
        setTableLoading(false)
      }
    }
    load()
  }, [pageIndex, filterOrgId, filterGrade, refreshKey])

  const hrefForPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page > 0) params.set("page", String(page))
    else params.delete("page")
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const create = async () => {
    setPending(true)
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "orgIds") {
        (value as string[]).forEach((orgId) => formData.append("orgIds", orgId));
      } else if (value) {
        formData.append(key, String(value));
      }
    });
    try {
      await toast.promise(createStudent(formData), {
        loading: t("addingStudent"),
        success: t("studentAdded"),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (e: any) => e.message ?? t("failedToAddStudent"),
      })
      setForm({ orgIds: [], name: "", number: "", grade: "", school: "", gender: "MALE", type: "" })
      if (pageIndex !== 0) router.push(hrefForPage(0))
      else setRefreshKey(Math.random())
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
      console.log(error)
    }
    finally {
      setPending(false)
    }
  }

  const filterOrg = organizations.find((o) => o.id === filterOrgId);
  const isFiltered = Boolean(filterOrgId || filterGrade);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">{t("students")}</h1>
      <p className="text-sm text-muted-foreground">{t("studentsSubtitle")}</p>

      {isFiltered && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-md border bg-accent/40 px-3 py-2 text-sm">
          <span>
            {t("filteredBy")}
            {filterOrg && <> {t("organizationWord")} <strong>{filterOrg.name}</strong></>}
            {filterOrg && filterGrade !== undefined && " · "}
            {filterGrade !== undefined && <>{t("gradeWordLower")} <strong>{tm("grades", filterGrade)}</strong></>}
          </span>
          <Link href="/students" className="text-xs text-primary hover:underline">
            {t("clearFilter")}
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
          multiple
          value={form.orgIds}
          onChange={(e) =>
            setForm({ ...form, orgIds: Array.from(e.target.selectedOptions, (o) => o.value) })
          }
          title={t("orgOptionPlaceholder")}
          className="h-9 min-w-0 rounded-lg border border-input bg-background px-3 text-sm"
        >
          {organizations?.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <input
          required
          placeholder={t("namePlaceholder")}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="h-9 rounded-full border border-input bg-background px-3 text-sm"
        />
        <input
          required
          placeholder={t("numberPlaceholder")}
          value={form.number}
          onChange={(e) => setForm({ ...form, number: e.target.value })}
          className="h-9 rounded-full border border-input bg-background px-3 text-sm"
        />
        <select
          required
          value={form.grade}
          onChange={(e) => setForm({ ...form, grade: e.target.value })}
          className="h-9 rounded-full border border-input bg-background px-3 text-sm"
        >
          <option value="">{t("gradeOptionPlaceholder")}</option>
          {Object.keys(Grades).map((value) => (
            <option key={value} value={value}>
              {tm("grades", value)}
            </option>
          ))}
        </select>
        <input
          required
          placeholder={t("schoolPlaceholder")}
          value={form.school}
          onChange={(e) => setForm({ ...form, school: e.target.value })}
          className="h-9 rounded-full border border-input bg-background px-3 text-sm"
        />
        <select
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
          className="h-9 rounded-full border border-input bg-background px-3 text-sm"
        >
          <option value="MALE">{t("male")}</option>
          <option value="FEMALE">{t("female")}</option>
        </select>
        <input
          placeholder={t("typeOptionalPlaceholder")}
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="h-9 rounded-full border border-input bg-background px-3 text-sm"
        />
        <button
          disabled={pending}
          className="h-9 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {t("add")}
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-start text-xs text-muted-foreground">
              <tr>
                <th className="p-2">{t("namePlaceholder")}</th>
                <th className="p-2">{t("colNumber")}</th>
                <th className="p-2">{t("colGrade")}</th>
                <th className="p-2">{t("colSchool")}</th>
                <th className="p-2">{t("organizationWord")}</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {tableLoading && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Spinner />
                      {t("loading")}
                    </div>
                  </td>
                </tr>
              )}
              {!tableLoading && (students ?? []).map((s) => (
                <StudentRow
                  key={s.id}
                  student={s}
                  organizations={organizations}
                  onDelete={(id) => setStudents((prev) => prev.filter((student) => student.id !== id))}
                  onUpdate={(updated) =>
                    setStudents((prev) => prev.map((student) => (student.id === updated.id ? updated : student)))
                  }
                />
              ))}
              {!tableLoading && students && students?.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">
                    {t("noStudentsYet")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {pageIndex > 0 ? (
          <Link
            href={hrefForPage(pageIndex - 1)}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {t("previous")}
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-md px-3 py-2 text-sm text-muted-foreground/40">
            {t("previous")}
          </span>
        )}
        <span className="text-xs text-muted-foreground">{t("page")} {pageIndex + 1}</span>
        {hasMore ? (
          <Link
            href={hrefForPage(pageIndex + 1)}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {t("next")}
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-md px-3 py-2 text-sm text-muted-foreground/40">
            {t("next")}
          </span>
        )}
      </div>
    </div>
  );
}
