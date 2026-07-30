"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { createOrganization, deleteOrganization, getOrganizations } from "@/src/lib/actions/api/organizations/organizations-actions";
import { Organization } from "@/src/lib/types";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [error, setError] = useState<Error>()
  const [pending, setPending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pageIndex, setPageIndex] = useState(0)
  const [form, setForm] = useState({
    name: '',
    subject: '',
    picUrl: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOrganizations(pageIndex)
        const entries = data.organizations ?? []
        setOrganizations((prev) => (pageIndex === 0 ? entries : [...prev, ...entries]))
        setLoading(false)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (e: any) {
        setError(e)
        setLoading(false)
      }
    }
    load()
  }, [pageIndex])

  const create = async () => {
    try {
      setPending(true)
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, String(value));
      });
      await createOrganization(formData).then(() => {
        setForm({ name: '', subject: '', picUrl: '' })
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

  const remove = async (id: string) => {
    try {
      await deleteOrganization(id).then(() => {
        setOrganizations((prev) => prev.filter((o) => o.id !== id))
      })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
      console.log(error)
      setError(error.message)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">Organizations</h1>
      <p className="text-sm text-muted-foreground">Partner schools you distribute to.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          create();
        }}
        className="mt-6 flex flex-wrap gap-2 rounded-lg border bg-card p-3"
      >
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name"
          required
          className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
        />
        <input
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          placeholder="Subject"
          required
          className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
        />
        <input
          value={form.picUrl}
          onChange={(e) => setForm({ ...form, picUrl: e.target.value })}
          placeholder="Picture URL"
          required
          className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
        />
        <button
          disabled={pending}
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          Add
        </button>
      </form>

      {error && (
        <p className="mt-2 text-sm text-destructive">{error.message}</p>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Subject</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              )}
              {organizations.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-2 font-medium">{o.name}</td>
                  <td className="p-2 text-muted-foreground">{o.subject}</td>
                  <td className="p-2 text-right whitespace-nowrap">
                    <Link
                      href={`/authenticated/organizations/${o.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => remove(o.id)}
                      className="ml-3 text-xs text-destructive hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {organizations.length === 0 && !loading && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-muted-foreground">
                    No organizations yet.
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
