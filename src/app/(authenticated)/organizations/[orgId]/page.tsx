"use client"
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { getOrganizationById, updateOrganization, restockInventory } from "@/src/lib/actions/api/organizations/organizations-actions";
import { getBookEditions } from "@/src/lib/actions/api/books/book-actions";
import { uploadImage } from "@/src/lib/actions/api/upload/upload-actions";
import { BookEdition, BookInventory, Grades, Organization } from "@/src/lib/types";
import { useLang } from "@/components/lang-provider";
import { PageLoader } from "@/components/spinner";

const OTHER_EDITION = "__other__";

export default function OrganizationDetailPage() {
  const { t, tm } = useLang();
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;

  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error>()
  const [isEditing, setIsEditing] = useState(false)
  const [pending, setPending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ name: "", subject: "", picUrl: "" })
  const [editions, setEditions] = useState<BookEdition[]>([])
  const [restockPending, setRestockPending] = useState(false)
  const [restockForm, setRestockForm] = useState({
    grade: "",
    booksCount: "0",
    codesCount: "0",
    editionId: "",
    newEditionName: "",
  })
  const editionIsOther = restockForm.editionId === OTHER_EDITION

  const handleImageChange = async (file: File | undefined) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "organizations");
    setUploading(true)
    try {
      const { url } = await toast.promise(uploadImage(formData), {
        loading: t("uploadingImage"),
        success: t("imageUploaded"),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (e: any) => e.message ?? t("failedToUploadImage"),
      })
      setForm((f) => ({ ...f, picUrl: url }))
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
      console.log(error)
    }
    finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOrganizationById(orgId)
        setOrganization(data.organization ?? null)
        if (data.organization) {
          setForm({
            name: data.organization.name,
            subject: data.organization.subject,
            picUrl: data.organization.picUrl ?? "",
          })
        }
        setLoading(false)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (e: any) {
        setError(e)
        setLoading(false)
      }
    }
    load()
  }, [orgId])

  useEffect(() => {
    const loadEditions = async () => {
      try {
        const data = await getBookEditions()
        setEditions(data.editions ?? [])
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (e: any) {
        console.log(e)
      }
    }
    loadEditions()
  }, [])

  const save = async () => {
    setPending(true)
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('subject', form.subject);
    if (form.picUrl) formData.append('picUrl', form.picUrl);
    try {
      const { organization: updated } = await toast.promise(updateOrganization(orgId, formData), {
        loading: t("saving"),
        success: t("organizationUpdated"),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (e: any) => e.message ?? t("failedToUpdateOrganization"),
      })
      setOrganization(updated)
      setIsEditing(false)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (e: any) {
      console.log(e)
    }
    finally {
      setPending(false)
    }
  }

  const restock = async () => {
    setRestockPending(true)
    const formData = new FormData();
    formData.append('grade', restockForm.grade);
    formData.append('booksCount', restockForm.booksCount || "0");
    formData.append('codesCount', restockForm.codesCount || "0");
    if (Number(restockForm.booksCount) > 0) {
      if (editionIsOther) formData.append('newEditionName', restockForm.newEditionName);
      else formData.append('editionId', restockForm.editionId);
    }
    try {
      const { organization: updated } = await toast.promise(restockInventory(orgId, formData), {
        loading: t("restocking"),
        success: t("inventoryRestocked"),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (e: any) => e.message ?? t("failedToRestock"),
      })
      if (updated) setOrganization(updated)
      setRestockForm({ grade: "", booksCount: "0", codesCount: "0", editionId: "", newEditionName: "" })
      if (editionIsOther && restockForm.newEditionName.trim()) {
        const data = await getBookEditions()
        setEditions(data.editions ?? [])
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (e: any) {
      console.log(e)
    }
    finally {
      setRestockPending(false)
    }
  }

  if (loading) {
    return <PageLoader />
  }

  if (!organization) {
    return (
      <div>
        <p className="text-sm text-destructive">{error?.message ?? t("orgNotFound")}</p>
        <Link href="/organizations" className="text-sm text-primary hover:underline">
          ← {t("organizations")}
        </Link>
      </div>
    )
  }

  const codesByGrade = new Map((organization.inventory ?? []).map((i) => [i.grade, i.codesCount]));
  const booksByGrade = new Map<number, BookInventory[]>();
  for (const bi of organization.bookInventory ?? []) {
    const arr = booksByGrade.get(bi.grade) ?? [];
    arr.push(bi);
    booksByGrade.set(bi.grade, arr);
  }
  const grades = Array.from(new Set([...codesByGrade.keys(), ...booksByGrade.keys()])).sort((a, b) => a - b);

  const restockValid =
    Boolean(restockForm.grade) &&
    (Number(restockForm.codesCount) > 0 ||
      (Number(restockForm.booksCount) > 0 && (editionIsOther ? restockForm.newEditionName.trim() : restockForm.editionId)));

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/organizations" className="text-sm text-muted-foreground hover:underline">
        ← {t("organizations")}
      </Link>

      <div className="mt-3 flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {organization.picUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={organization.picUrl}
              alt={organization.name}
              className="h-16 w-16 shrink-0 rounded-md object-cover"
            />
          )}
          <div className="min-w-0">
            {isEditing ? (
              <div className="flex w-full min-w-0 flex-col gap-2 sm:w-64">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-9 w-full rounded-full border border-input bg-background px-3 text-sm font-semibold"
                  placeholder={t("namePlaceholder")}
                />
                <input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="h-9 w-full rounded-full border border-input bg-background px-3 text-sm"
                  placeholder={t("subjectPlaceholder")}
                />
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => handleImageChange(e.target.files?.[0])}
                  className="h-9 w-full rounded-full border border-input bg-background px-2 text-sm"
                />
                {form.picUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.picUrl}
                    alt=""
                    className="h-16 w-16 rounded-md object-cover"
                  />
                )}
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold">{organization.name}</h1>
                <p className="text-sm text-muted-foreground">{organization.subject}</p>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 gap-2 self-start">
          {isEditing ? (
            <>
              <button
                disabled={pending || uploading}
                onClick={save}
                className="h-8 rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {t("save")}
              </button>
              <button
                disabled={pending}
                onClick={() => {
                  setIsEditing(false)
                  setForm({ name: organization.name, subject: organization.subject, picUrl: organization.picUrl ?? "" })
                }}
                className="h-8 rounded-full px-3 text-sm text-muted-foreground hover:bg-accent"
              >
                {t("cancel")}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="h-8 rounded-full px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {t("edit")}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">{t("inventoryByGrade")}</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            restock();
          }}
          className="mt-3 flex flex-wrap items-end gap-2 rounded-lg border bg-card p-3"
        >
          <label className="text-xs text-muted-foreground">
            {t("colGrade")}
            <select
              required
              value={restockForm.grade}
              onChange={(e) => setRestockForm({ ...restockForm, grade: e.target.value })}
              className="mt-1 block h-9 rounded-full border border-input bg-background px-3 text-sm"
            >
              <option value="">{t("gradeOptionPlaceholder")}</option>
              {Object.keys(Grades).map((value) => (
                <option key={value} value={value}>
                  {tm("grades", value)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            {t("colCodes")}
            <input
              type="number"
              min={0}
              value={restockForm.codesCount}
              onChange={(e) => setRestockForm({ ...restockForm, codesCount: e.target.value })}
              className="mt-1 block h-9 w-24 rounded-full border border-input bg-background px-3 text-sm"
            />
          </label>
          <label className="text-xs text-muted-foreground">
            {t("colBooks")}
            <input
              type="number"
              min={0}
              value={restockForm.booksCount}
              onChange={(e) => setRestockForm({ ...restockForm, booksCount: e.target.value })}
              className="mt-1 block h-9 w-24 rounded-full border border-input bg-background px-3 text-sm"
            />
          </label>
          <label className="text-xs text-muted-foreground">
            {t("colEdition")}
            <select
              value={restockForm.editionId}
              onChange={(e) => setRestockForm({ ...restockForm, editionId: e.target.value })}
              className="mt-1 block h-9 rounded-full border border-input bg-background px-3 text-sm"
            >
              <option value="">{t("editionOptionPlaceholder")}</option>
              {editions.map((ed) => (
                <option key={ed.id} value={ed.id}>
                  {ed.name}
                </option>
              ))}
              <option value={OTHER_EDITION}>{t("otherEditionOption")}</option>
            </select>
          </label>
          {editionIsOther && (
            <label className="text-xs text-muted-foreground">
              {t("newEditionNameLabel")}
              <input
                placeholder={t("newEditionPlaceholder")}
                value={restockForm.newEditionName}
                onChange={(e) => setRestockForm({ ...restockForm, newEditionName: e.target.value })}
                className="mt-1 block h-9 rounded-full border border-input bg-background px-3 text-sm"
              />
            </label>
          )}
          <button
            disabled={restockPending || !restockValid}
            className="h-9 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {t("restock")}
          </button>
        </form>

        <div className="mt-3 overflow-hidden rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-start text-xs text-muted-foreground">
                <tr>
                  <th className="p-2">{t("colGrade")}</th>
                  <th className="p-2 text-end">{t("colCodes")}</th>
                  <th className="p-2">{t("colBooks")}</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => (
                  <tr key={grade} className="border-t align-top">
                    <td className="p-2 font-medium whitespace-nowrap">{tm("grades", grade)}</td>
                    <td className="p-2 text-end">{codesByGrade.get(grade) ?? 0}</td>
                    <td className="p-2">
                      {(booksByGrade.get(grade) ?? []).length > 0 ? (
                        <ul className="space-y-0.5">
                          {(booksByGrade.get(grade) ?? []).map((bi) => (
                            <li key={bi.id} className="flex items-center justify-between gap-2 text-xs">
                              <span>{bi.edition?.name ?? bi.editionId.slice(0, 8)}</span>
                              <span className="font-medium">{bi.count}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-2 text-end whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setRestockForm((f) => ({ ...f, grade: String(grade) }))}
                        className="text-xs text-primary hover:underline"
                      >
                        {t("restock")}
                      </button>
                      <Link
                        href={`/students?orgId=${organization.id}&grade=${grade}`}
                        className="ms-3 text-xs text-muted-foreground hover:underline"
                      >
                        {t("students")}
                      </Link>
                    </td>
                  </tr>
                ))}
                {grades.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      {t("noInventoryYet")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
