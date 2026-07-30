'use client'
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV = [
  { href: "/authenticated/dashboard", label: "Dashboard" },
  { href: "/authenticated/organizations", label: "Organizations" },
  { href: "/authenticated/sales-index", label: "Sales" },
  { href: "/authenticated/students", label: "Students" },
  { href: "/authenticated/timetable-edit", label: "Timetable" },
  { href: "/authenticated/news-edit", label: "News" },
] as const;

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href="/" className="shrink-0 text-lg font-semibold">
            School Hub
          </Link>

          <nav className="ml-4 hidden flex-1 items-center gap-1 overflow-x-auto md:flex">
            {NAV.map((n) => (
              <NavLink key={n.href} href={n.href} label={n.label} active={pathname?.startsWith(n.href)} />
            ))}
          </nav>

          <button
            // onClick={() => signOut.mutate()}
            className="ml-auto hidden shrink-0 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground md:block"
          >
            Sign out
          </button>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <nav className="flex flex-col gap-0.5 border-t bg-card px-2 py-2 md:hidden">
            {NAV.map((n) => (
              <NavLink
                key={n.href}
                href={n.href}
                label={n.label}
                active={pathname?.startsWith(n.href)}
                block
                onClick={() => setMenuOpen(false)}
              />
            ))}
            <button
              // onClick={() => signOut.mutate()}
              className="rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Sign out
            </button>
          </nav>
        )}
      </header>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  label,
  active,
  block,
  onClick,
}: {
  href: string;
  label: string;
  active?: boolean;
  block?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`whitespace-nowrap rounded-md px-3 py-2 text-sm hover:bg-accent ${block ? "block" : ""} ${
        active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
