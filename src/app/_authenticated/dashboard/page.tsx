import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";


type Org = { id: string; name: string; books_count: number; codes_count: number };
type Sale = { id: string; org_id: string; items: unknown; sold_at: string };

export default function DashboardPage() {
  const orgs = useQuery({
    queryKey: ["organizations"],
    queryFn: () => api<{ organizations: Org[] }>("/api/organizations"),
    retry: false,
  });
  const sales = useQuery({
    queryKey: ["sales"],
    queryFn: () => api<{ sales: Sale[] }>("/api/sales"),
    retry: false,
  });

  const totalBooks =
    orgs.data?.organizations?.reduce((a, b) => a + (b.books_count ?? 0), 0) ?? 0;
  const totalCodes =
    orgs.data?.organizations?.reduce((a, b) => a + (b.codes_count ?? 0), 0) ?? 0;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Overview of inventory and activity.</p>

      {(orgs.error || sales.error) && (
        <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          Data endpoints returned errors. Wire up{" "}
          <code>src/lib/db.server.ts</code> to connect to your Postgres.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Organizations" value={orgs.data?.organizations?.length ?? 0} />
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
              {(sales.data?.sales ?? []).slice(0, 10).map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2 font-mono text-xs">{s.id.slice(0, 8)}</td>
                  <td className="p-2">{s.org_id.slice(0, 8)}</td>
                  <td className="p-2">{new Date(s.sold_at).toLocaleString()}</td>
                </tr>
              ))}
              {(!sales.data?.sales || sales.data.sales.length === 0) && (
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
