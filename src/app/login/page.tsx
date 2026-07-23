'use client'
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";


// export const metadata = {
//  title: "Sign in — School Hub",
//   name: "description", content: "Sign in to manage inventory, sales, and timetable.",
//   twitter: {
//    title: "Sign in — School Hub",
//     name: "description", content: "Sign in to manage inventory, sales, and timetable.",
//   },
//   openopenGraph: {
//    title: "Sign in — School Hub",
//     name: "description", content: "Sign in to manage inventory, sales, and timetable.",
//   }
// };
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  //const qc = useQueryClient();
  const router = useRouter();

  // const mutation = useMutation({
  //   mutationFn: () =>
  //     api<{ user: { id: string; username: string } }>("/api/auth/login", {
  //       method: "POST",
  //       body: JSON.stringify({ username, password }),
  //     }),
  //   onSuccess: async () => {
  //     await qc.invalidateQueries({ queryKey: ["me"] });
  //     router.push("/dashboard");
  //   },
  //   onError: (e: Error) => setErr(e.message),
  // });

  return (
    <div className="min-h-screen bg-background">
      <title>Sign in</title>
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-16">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Access the inventory and timetable admin.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErr(null);
          //  mutation.mutate();
          }}
          className="mt-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button
            type="submit"
            // disabled={mutation.isPending}
            className="h-10 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {/* {mutation.isPending ? "Signing in…" : "Sign in"} */}
          </button>
        </form>
      </main>
    </div>
  );
}
