import { useLang } from "@/components/lang-provider";

export function SiteFooter() {
  const { t } = useLang();
  return (
    <footer className="mt-16 border-t bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {t("brand")}. {t("footerRights")}</p>
          <p>{t("footerNote")}</p>
        </div>
      </div>
    </footer>
  );
}
