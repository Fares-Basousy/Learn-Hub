'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Lang, type TKey } from "@/lib/i18n";

type MapKey = "days" | "grades" | "courses";
type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (k: TKey) => string;
  tm: (category: MapKey, key: string | number) => string;
  dir: "ltr" | "rtl";
};

const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const getLang = ()=>{
    const stored = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (stored === "en" || stored === "ar") setLangState(stored);}
    getLang();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem("lang", lang);
    } catch {}
  }, [lang]);

  const dir = lang === "ar" ? "rtl" : "ltr";
  const t = (k: TKey) => (translations[lang][k] as string) ?? (translations.en[k] as string) ?? k;
  const tm = (category: MapKey, key: string | number) => {
    const k = String(key);
    const map = translations[lang][category] as Record<string, string>;
    const enMap = translations.en[category] as Record<string, string>;
    return map?.[k] ?? enMap?.[k] ?? k;
  };

  return (
    <LangContext.Provider
      value={{
        lang,
        setLang: setLangState,
        toggle: () => setLangState((l) => (l === "en" ? "ar" : "en")),
        t,
        tm,
        dir,
      }}
    >
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
