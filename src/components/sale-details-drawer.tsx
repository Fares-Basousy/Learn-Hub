"use client"
import { Sale } from "@/src/lib/types";
import { useLang } from "@/components/lang-provider";

export default function SaleDetailsDrawer({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const { t, tm } = useLang();

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="h-full w-full max-w-md overflow-y-auto bg-card p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("saleDetails")}</h2>
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 p-3">
            <dt className="text-muted-foreground">{t("colSaleId")}</dt>
            <dd className="font-mono text-xs">{sale.id}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 p-3">
            <dt className="text-muted-foreground">{t("colSoldBy")}</dt>
            <dd className="text-end">
              <div className="font-medium">{sale.user?.name ?? "—"}</div>
              <div className="font-mono text-xs text-muted-foreground">{sale.userId}</div>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 p-3">
            <dt className="text-muted-foreground">{t("colSoldAt")}</dt>
            <dd>{new Date(sale.soldAt).toLocaleString()}</dd>
          </div>
        </dl>

        <h3 className="mt-6 text-sm font-semibold">{t("colItems")}</h3>
        <div className="mt-2 space-y-2">
          {sale.items.map((i) => (
            <div key={i.id} className="rounded-md border p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{i.org?.name ?? t("deletedOrganization")}</span>
                <span className="text-xs text-muted-foreground">
                  {tm("grades", i.grade)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>
                  {t("colBooks")}: <span className="font-medium text-foreground">{i.booksCount}</span>
                  {i.booksCount > 0 && i.edition?.name && (
                    <span className="text-muted-foreground"> ({i.edition.name})</span>
                  )}
                </span>
                <span>
                  {t("colCodes")}: <span className="font-medium text-foreground">{i.codesCount}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
