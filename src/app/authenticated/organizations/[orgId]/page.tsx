"use client"
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { getOrganizationById, updateOrganization } from "@/src/lib/actions/api/organizations/organizations-actions";
import { uploadImage } from "@/src/lib/actions/api/upload/upload-actions";
import { Grades, Organization } from "@/src/lib/types";
import { useLang } from "@/components/lang-provider";

export default function OrganizationDetailPage() {
  const { t } = useLang();
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;

  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error>()
  const [isEditing, setIsEditing] = useState(false)
  const [pending, setPending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ name: "", subject: "", picUrl: "" })

  const handleImageChange = async (file: File | undefined) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "organizations");
    setUploading(true)
    try {
      const { url } = await toast.promise(uploadImage(formData), {
        loading: "Uploading image…",
        success: "Image uploaded",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (e: any) => e.message ?? "Failed to upload image",
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

  const save = async () => {
    setPending(true)
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('subject', form.subject);
    if (form.picUrl) formData.append('picUrl', form.picUrl);
    try {
      const { organization: updated } = await toast.promise(updateOrganization(orgId, formData), {
        loading: "Saving…",
        success: "Organization updated",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (e: any) => e.message ?? "Failed to update organization",
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

  if (loading) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>
  }

  if (!organization) {
    return (
      <div>
        <p className="text-sm text-destructive">{error?.message ?? t("orgNotFound")}</p>
        <Link href="/authenticated/organizations" className="text-sm text-primary hover:underline">
          ← {t("organizations")}
        </Link>
      </div>
    )
  }

  const inventory = [...(organization.inventory ?? [])].sort((a, b) => a.grade - b.grade)

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/authenticated/organizations" className="text-sm text-muted-foreground hover:underline">
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
        <div className="mt-3 overflow-hidden rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="p-2">{t("colGrade")}</th>
                  <th className="p-2 text-right">{t("colBooks")}</th>
                  <th className="p-2 text-right">{t("colCodes")}</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {inventory.map((inv) => (
                  <tr key={inv.id} className="border-t">
                    <td className="p-2 font-medium whitespace-nowrap">{Grades[inv.grade as keyof typeof Grades] ?? `Grade ${inv.grade}`}</td>
                    <td className="p-2 text-right">{inv.booksCount}</td>
                    <td className="p-2 text-right">{inv.codesCount}</td>
                    <td className="p-2 text-right whitespace-nowrap">
                      <Link
                        href={`/authenticated/students?orgId=${organization.id}&grade=${inv.grade}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {t("students")}
                      </Link>
                    </td>
                  </tr>
                ))}
                {inventory.length === 0 && (
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
