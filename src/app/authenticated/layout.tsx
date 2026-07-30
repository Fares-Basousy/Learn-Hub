'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/authenticated/dashboard", label: "Dashboard" },
  { href: "/authenticated/organizations", label: "Organizations" },
  { href: "/authenticated/inventory", label: "Inventory" },
  { href: "/authenticated/sales-index", label: "Sales" },
  { href: "/authenticated/students", label: "Students" },
  { href: "/authenticated/timetable-edit", label: "Timetable" },
  { href: "/authenticated/news-edit", label: "News" },
] as const;

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href="/" className="text-lg font-semibold">
            School Hub
          </Link>
          <nav className="ml-4 flex flex-1 items-center gap-1 overflow-x-auto">
            {NAV.map((n) => {
              const active = pathname?.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`whitespace-nowrap rounded-md px-3 py-2 text-sm hover:bg-accent ${
                    active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <button
            // onClick={() => signOut.mutate()}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
