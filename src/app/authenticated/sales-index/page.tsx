"use client"

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getSales } from "@/src/lib/actions/api/sales/sales-actions";
import { getOrganizationsAdmin } from "@/src/lib/actions/api/organizations/organizations-actions";
import { Grades, Organization, Sale } from "@/src/lib/types";
import SaleModal from "@/src/components/sale-modal";

export default function SalesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <SalesPageInner />
    </Suspense>
  );
}

function SalesPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawPage = Number(searchParams.get("page"));
  // page is 0-indexed internally; an invalid/missing param falls back to the first page.
  const pageIndex = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 0;

  const [sales, setSales] = useState<Sale[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [error, setError] = useState<Error>()
  const [pending, setPending] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        setPending(true)
        const data = await getSales(pageIndex)
        setSales(data.sales?.length ? data.sales : [])
        setHasMore(Boolean(data.hasMore))
        setPending(false)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (e: any) {
        setError(e)
        setPending(false)
      }
    }
    load()
  }, [pageIndex, refreshKey])

  useEffect(() => {
    const loadOrgs = async () => {
      try {
        const data = await getOrganizationsAdmin()
        setOrganizations(data.organizations ?? [])
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (e: any) {
        setError(e)
      }
    }
    loadOrgs()
  }, [])

  const hrefForPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page > 0) params.set("page", String(page))
    else params.delete("page")
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Sales</h1>
          <p className="text-sm text-muted-foreground">History of book and code sales.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="h-9 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New sale
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error.message}</p>}

      <div className="mt-6 overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-2">ID</th>
                <th className="p-2">Items</th>
                <th className="p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {(sales ?? []).map((s: Sale) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2 font-mono text-xs whitespace-nowrap">{s.id.slice(0, 8)}</td>
                  <td className="min-w-[220px] p-2 text-xs">
                    {s.items
                      .map(
                        (i) =>
                          `${i.booksCount} books / ${i.codesCount} codes — ${i.org?.name ?? i.orgId.slice(0, 8)} (${Grades[i.grade as keyof typeof Grades] ?? `grade ${i.grade}`})`,
                      )
                      .join(", ")}
                  </td>
                  <td className="p-2 whitespace-nowrap">{new Date(s.soldAt).toLocaleString()}</td>
                </tr>
              ))}
              {(sales?.length === 0) && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-muted-foreground">
                    No sales yet.
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

      {showModal && (
        <SaleModal
          organizations={organizations}
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false)
            if (pageIndex !== 0) router.push(hrefForPage(0))
            else setRefreshKey(Math.random())
          }}
        />
      )}
    </div>
  );
}
