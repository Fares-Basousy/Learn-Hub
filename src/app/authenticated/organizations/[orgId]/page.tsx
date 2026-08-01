"use client"
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { getOrganizationById, updateOrganization } from "@/src/lib/actions/api/organizations/organizations-actions";
import { Grades, Organization } from "@/src/lib/types";

export default function OrganizationDetailPage() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;

  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error>()
  const [isEditing, setIsEditing] = useState(false)
  const [pending, setPending] = useState(false)
  const [form, setForm] = useState({ name: "", subject: "", picUrl: "" })

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
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (!organization) {
    return (
      <div>
        <p className="text-sm text-destructive">{error?.message ?? "Organization not found."}</p>
        <Link href="/authenticated/organizations" className="text-sm text-primary hover:underline">
          Back to organizations
        </Link>
      </div>
    )
  }

  const inventory = [...(organization.inventory ?? [])].sort((a, b) => a.grade - b.grade)

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/authenticated/organizations" className="text-sm text-muted-foreground hover:underline">
        ← Organizations
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
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm font-semibold"
                  placeholder="Name"
                />
                <input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  placeholder="Subject"
                />
                <input
                  value={form.picUrl}
                  onChange={(e) => setForm({ ...form, picUrl: e.target.value })}
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  placeholder="Picture URL"
                />
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
                disabled={pending}
                onClick={save}
                className="h-8 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                Save
              </button>
              <button
                disabled={pending}
                onClick={() => {
                  setIsEditing(false)
                  setForm({ name: organization.name, subject: organization.subject, picUrl: organization.picUrl ?? "" })
                }}
                className="h-8 rounded-md px-3 text-sm text-muted-foreground hover:bg-accent"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="h-8 rounded-md px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Inventory by grade</h2>
        <div className="mt-3 overflow-hidden rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="p-2">Grade</th>
                  <th className="p-2 text-right">Books</th>
                  <th className="p-2 text-right">Codes</th>
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
                        Students
                      </Link>
                    </td>
                  </tr>
                ))}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      No inventory recorded yet.
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
