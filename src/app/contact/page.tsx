'use client';

import Head from "next/head";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactInfoBlock } from "@/components/contact-info";
import { useLang } from "@/components/lang-provider";

export default function ContactPage() {
  const { t } = useLang();

  return (
    <>
      <Head>
        <title>Contact — School Hub</title>
        <meta name="description" content="Get in touch with our team." />

        <meta property="og:title" content="Contact — School Hub" />
        <meta
          property="og:description"
          content="Get in touch with our team."
        />

        <meta name="twitter:title" content="Contact — School Hub" />
        <meta
          name="twitter:description"
          content="Get in touch with our team."
        />
      </Head>

      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-16">
          <h1 className="text-3xl font-bold">{t("contactTitle")}</h1>
          <p className="mt-4 text-muted-foreground">
            {t("contactBody")}
          </p>
          <div className="mt-8">
            <ContactInfoBlock />
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}