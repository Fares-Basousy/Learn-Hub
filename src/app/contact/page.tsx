import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useLang } from "@/components/lang-provider";


export const metadata = {
 title: "Contact — School Hub",
  name: "description", content: "Get in touch with our team.",
  twitter: {
   title: "Contact — School Hub",
    name: "description", content: "Get in touch with our team.",
  },
  openopenGraph: {
   title: "Contact — School Hub",
    name: "description", content: "Get in touch with our team.",

  }
};
export default function ContactPage() {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold">{t("contactTitle")}</h1>
        <p className="mt-4 text-muted-foreground">{t("contactBody")}</p>
      </main>
      <SiteFooter />
    </div>
  );
}
