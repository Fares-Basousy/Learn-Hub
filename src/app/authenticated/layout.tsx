'use client'
import {Link, Outlet, redirect,useNavigate,useRouter} from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function checkAuth() {
  try {
    await api<{ user: { id: string; username: string } }>("/api/auth/me");
    return true;
  } catch {
    return false;
  }
}



const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/organizations", label: "Organizations" },
  { to: "/inventory", label: "Inventory" },
  { to: "/sales", label: "Sales" },
  { to: "/students", label: "Students" },
  { to: "/timetable/edit", label: "Timetable" },
  { to: "/news/edit", label: "News" },
] as const;

export default function AuthedLayout() {
  // const qc = useQueryClient();
  // const navigate = useNavigate();
  // const router = useRouter();
  // const signOut = useMutation({
  //   mutationFn: () => api("/api/auth/logout", { method: "POST" }),
  //   onSuccess: async () => {
  //     await qc.cancelQueries();
  //     qc.clear();
  //     router.invalidate();
  //     navigate({ to: "/login", replace: true });
  //   },
  // });

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-56 shrink-0 border-r bg-card md:block">
        <div className="p-4">
          <Link to="/" className="text-lg font-semibold">
            School Hub
          </Link>
          <div className="mt-0.5 text-xs text-muted-foreground">Admin</div>
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "bg-accent text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-2">
          <button
           // onClick={() => signOut.mutate()}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b bg-background px-4 md:hidden">
          <Link to="/" className="text-sm font-semibold">
            School Hub
          </Link>
          <div className="ml-auto flex gap-2 overflow-x-auto text-sm">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeProps={{ className: "text-foreground font-semibold" }}
                className="whitespace-nowrap text-muted-foreground"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
