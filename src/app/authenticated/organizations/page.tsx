"use client"
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { createOrganization, deleteOrganization, getOrganizations } from "@/src/lib/actions/api/organizations/organizations-actions";
import { Organization } from "@/src/lib/types";

export default function OrganizationsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <OrganizationsPageInner />
    </Suspense>
  );
}

function OrganizationsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawPage = Number(searchParams.get("page"));
  // page is 0-indexed internally; an invalid/missing param falls back to the first page.
  const pageIndex = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 0;

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [pending, setPending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form, setForm] = useState({
    name: '',
    subject: '',
    picUrl: '',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getOrganizations(pageIndex)
        setOrganizations(data.organizations ?? [])
        setHasMore(Boolean(data.hasMore))
        setLoading(false)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (e: any) {
        toast.error(e.message ?? "Failed to load organizations")
        setLoading(false)
      }
    }
    load()
  }, [pageIndex, refreshKey])

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
      if (value) formData.append(key, String(value));
    });
    try {
      await toast.promise(createOrganization(formData), {
        loading: "Adding organization…",
        success: "Organization added",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (e: any) => e.message ?? "Failed to add organization",
      })
      setForm({ name: '', subject: '', picUrl: '' })
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

  const remove = async (id: string) => {
    try {
      await toast.promise(deleteOrganization(id), {
        loading: "Deleting organization…",
        success: "Organization deleted",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (e: any) => e.message ?? "Failed to delete organization",
      })
      setOrganizations((prev) => prev.filter((o) => o.id !== id))
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
      console.log(error)
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

      <div className="mt-3 flex items-center justify-between gap-2">
        {pageIndex > 0 ? (
          <Link
            href={hrefForPage(pageIndex - 1)}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Previous
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-md px-3 py-2 text-sm text-muted-foreground/40">
            Previous
          </span>
        )}
        <span className="text-xs text-muted-foreground">Page {pageIndex + 1}</span>
        {hasMore ? (
          <Link
            href={hrefForPage(pageIndex + 1)}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Next
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-md px-3 py-2 text-sm text-muted-foreground/40">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
