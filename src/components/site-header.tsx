import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Moon, Sun, Languages } from "lucide-react";
import { api } from "@/lib/api";
import { useTheme } from "@/components/theme-provider";
import { useLang } from "@/components/lang-provider";

type Me = { user: { id: string; username: string } };

export function SiteHeader() {
  // const { data } = useQuery({
  //   queryKey: ["me"],
  //   queryFn: () => api<Me>("/api/auth/me").catch(() => null),
  //   retry: false,
  //   staleTime: 60_000,
  // });
  // const user = data?.user ?? null;
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, toggle: toggleLang, t } = useLang();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {t("brand")}
        </Link>
        <nav className="flex items-center gap-2 text-sm sm:gap-4">
          <Link href="/" className="hidden text-muted-foreground hover:text-foreground sm:inline">
            {t("home")}
          </Link>
          <Link href="/about" className="hidden text-muted-foreground hover:text-foreground sm:inline">
            {t("about")}
          </Link>
          <Link href="/contact" className="hidden text-muted-foreground hover:text-foreground sm:inline">
            {t("contact")}
          </Link>
          <button
            type="button"
            onClick={toggleLang}
            aria-label={t("language")}
            className="inline-flex h-9 items-center gap-1 rounded-md border border-input px-2 text-xs font-medium hover:bg-accent"
          >
            <Languages className="h-4 w-4" />
            {lang === "en" ? "ع" : "EN"}
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t("theme")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input hover:bg-accent"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {false //user
           ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t("dashboard")}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-input px-3 py-1.5 font-medium hover:bg-accent"
            >
              {t("signIn")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
