import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useLang } from "@/components/lang-provider";
import { ContactInfoBlock } from "@/components/contact-info";


export const metadata = {
 title: "About — School Hub",
  name: "description", content: "About our organization and mission.",
  twitter: {
   title: "About — School Hub",
    name: "description", content: "About our organization and mission.",
  },
  openopenGraph: {
   title: "About — School Hub",
    name: "description", content: "About our organization and mission.",

  }
};
export default function AboutPage() {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold">{t("aboutTitle")}</h1>
        <p className="mt-4 text-muted-foreground">{t("aboutBody")}</p>
        <div className="mt-10 border-t pt-8">
          <ContactInfoBlock />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

