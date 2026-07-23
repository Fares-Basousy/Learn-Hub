import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getSales } from "@/src/lib/actions/api/sales/sales-actions";
import { useEffect, useState } from "react";
import { Sale } from "@/src/lib/types";



export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [error, setError] = useState<Error>()
  const [pending, setPending] = useState(true)
  const [pageIndex, setPageIndex] =useState(0)

  useEffect(()=>{
        const Load = async ()=>{
            try{
              setPending(true)
              const  data  = await getSales(pageIndex)
              const entries : Sale[] = data.sales?.length ? data.sales : [];
              setSales((prev : Sale[])=>[...prev,...entries])
              setPending(false)
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            catch(e : any){
              setError(e)
            }
            }
            Load()
      },[pageIndex])

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales</h1>
          <p className="text-sm text-muted-foreground">History of book and code sales.</p>
        </div>
        <Link
          href="/sales/new"
          className="h-9 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New sale
        </Link>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{(error as Error).message}</p>}

      <div className="mt-6 overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Org</th>
              <th className="p-2">Items</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {(sales?? []).map((s : Sale) => (
              <tr key={s.id} className="border-t">
                <td className="p-2 font-mono text-xs">{s.id.slice(0, 8)}</td>
                <td className="p-2 font-mono text-xs">{s.org_id.slice(0, 8)}</td>
                <td className="p-2 text-xs">
                  {Array.isArray(s.items)
                    ? s.items.map((i : { count: number; type: string }) => `${i.count}× ${i.type}`).join(", ")
                    : ""}
                </td>
                <td className="p-2">{new Date(s.sold_at).toLocaleString()}</td>
              </tr>
            ))}
            {(sales?.length === 0) && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                  No sales yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button
                    onClick={() => setPageIndex((prev)=>prev+1)}
                    disabled={pending}
                    className="text-xs text-destructive hover:underline"
                  >
                    Next
                  </button>
    </div>
  );
}
