"use client"

import { useEffect, useState } from "react";
import { getSales } from "@/src/lib/actions/api/sales/sales-actions";
import { getOrganizationsAdmin } from "@/src/lib/actions/api/organizations/organizations-actions";
import { Organization, Sale } from "@/src/lib/types";
import SaleModal from "@/src/components/sale-modal";



export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [error, setError] = useState<Error>()
  const [pending, setPending] = useState(true)
  const [pageIndex, setPageIndex] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setPending(true)
        const data = await getSales(pageIndex)
        const entries: Sale[] = data.sales?.length ? data.sales : [];
        setSales((prev: Sale[]) => (pageIndex === 0 ? entries : [...prev, ...entries]))
        setPending(false)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (e: any) {
        setError(e)
      }
    }
    load()
  }, [pageIndex, refreshKey])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOrganizationsAdmin()
        setOrganizations(data.organizations ?? [])
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (e: any) {
        setError(e)
      }
    }
    load()
  }, [])

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
                          `${i.booksCount} books / ${i.codesCount} codes — ${i.org?.name ?? i.orgId.slice(0, 8)} (grade ${i.grade})`,
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
      <button
        onClick={() => setPageIndex((prev) => prev + 1)}
        disabled={pending}
        className="mt-3 w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        Next
      </button>

      {showModal && (
        <SaleModal
          organizations={organizations}
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setPageIndex(0)
            setRefreshKey((k) => k + 1)
          }}
        />
      )}
    </div>
  );
}
