import { useState } from "react";
import Link from "next/link";
import { Moon, Sun, Languages, GraduationCap, Menu, X } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useLang } from "@/components/lang-provider";

export function SiteHeader() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, toggle: toggleLang, t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = false;
  const authHref = user ? "/dashboard" : "/login";
  const authLabel = user ? t("dashboard") : t("signIn");

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 text-lg font-semibold tracking-tight">
          <GraduationCap className="h-5 w-5 shrink-0 text-primary" />
          <span className="truncate">{t("brand")}</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm sm:gap-4">
          <Link href="/" className="hidden text-muted-foreground hover:text-foreground sm:inline">
            {t("home")}
          </Link>
          <Link href="/contact" className="hidden text-muted-foreground hover:text-foreground sm:inline">
            {t("contact")}
          </Link>
          <button
            type="button"
            data-testid="lang-toggle-button"
            onClick={toggleLang}
            aria-label={t("language")}
            className="inline-flex h-9 items-center gap-1 rounded-full border border-input px-3 text-xs font-medium hover:bg-accent"
          >
            <Languages className="h-4 w-4" />
            {lang === "en" ? "ع" : "EN"}
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t("theme")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input hover:bg-accent"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {user ? (
            <Link
              href={authHref}
              className="hidden rounded-full bg-primary px-4 py-1.5 font-medium text-primary-foreground hover:bg-primary/90 sm:inline-block"
            >
              {authLabel}
            </Link>
          ) : (
            <Link
              href={authHref}
              className="hidden rounded-full border border-input px-4 py-1.5 font-medium hover:bg-accent sm:inline-block"
            >
              {authLabel}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground sm:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-0.5 border-t bg-background px-4 py-2 sm:hidden">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {t("home")}
          </Link>
          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {t("contact")}
          </Link>
          <Link
            href={authHref}
            onClick={() => setMenuOpen(false)}
            className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            {authLabel}
          </Link>
        </nav>
      )}
    </header>
  );
}
