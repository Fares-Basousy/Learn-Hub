'use client'
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { SiteHeader } from "@/components/site-header";
import { useLang } from "@/components/lang-provider";

export default function LoginPage() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setIsPending(true);

    try {
      await toast.promise(
        signIn("credentials", { email, password, redirect: false }).then((result) => {
          if (result?.error) throw new Error("Invalid email or password.");
          return result;
        }),
        {
          loading: "Signing in…",
          success: "Signed in",
          error: (e) => e.message,
        },
      );
      router.push("/authenticated/dashboard");
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <title>{t("signIn")}</title>
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-16">
        <h1 className="text-2xl font-bold">{t("signIn")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("loginSubtitle")}
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">{t("emailLabel")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 h-10 w-full rounded-full border border-input bg-background px-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">{t("passwordLabel")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 h-10 w-full rounded-full border border-input bg-background px-3 text-sm"
            />
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="h-10 w-full rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {isPending ? t("signingIn") : t("signIn")}
          </button>
        </form>
      </main>
    </div>
  );
}
