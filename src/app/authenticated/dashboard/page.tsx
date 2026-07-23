"use client"
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { getOrganizationsAdmin } from "@/src/lib/actions/api/organizations/organizations-actions";
import { getSales } from "@/src/lib/actions/api/sales/sales-actions";


type Org = { id: string; name: string; books_count: number; codes_count: number };
type Sale = { id: string; org_id: string; items: unknown; sold_at: string };

export default function DashboardPage() {
  const [orgs, setOrgs] = useState<Org[]>([])
  const [salesPageIndex, setSalesOrgPageIndex] = useState(0)
  const [sales, setSales] = useState<Sale[]>([])
  const [error, setError] = useState<Error>()
   useEffect(()=>{
        const intialLoad = async ()=>{
            try{
              const  orgData  = await getOrganizationsAdmin()
              const  saleData =await getSales(salesPageIndex)
              setOrgs(orgData?.organizations?.length ? orgData.organizations : [])
              setSales(saleData?.sales?.length ? saleData.sales : [])
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            catch(e : any){
              setError(e)
            }
            }
            intialLoad()
      },[])

  const totalBooks =
    orgs?.reduce((a, b) => a + (b.books_count ?? 0), 0) ?? 0;
  const totalCodes =
    orgs?.reduce((a, b) => a + (b.codes_count ?? 0), 0) ?? 0;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Overview of inventory and activity.</p>

      {(error || error) && (
        <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          Data endpoints returned errors. Wire up{" "}
          <code>src/lib/db.server.ts</code> to connect to your Postgres.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Organizations" value={orgs?.length ?? 0} />
        <Stat label="Total books" value={totalBooks} />
        <Stat label="Total codes" value={totalCodes} />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Recent sales</h2>
        <div className="mt-3 overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-2">Sale</th>
                <th className="p-2">Organization</th>
                <th className="p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {(sales ?? []).slice(0, 10).map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2 font-mono text-xs">{s.id.slice(0, 8)}</td>
                  <td className="p-2">{s.org_id.slice(0, 8)}</td>
                  <td className="p-2">{new Date(s.sold_at).toLocaleString()}</td>
                </tr>
              ))}
              {(!sales || sales.length === 0) && (
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
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-3xl font-bold">{value}</div>
    </div>
  );
}
