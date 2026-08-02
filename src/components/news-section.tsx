import { ArrowRight, Megaphone } from "lucide-react";
import { type NewsItem } from "../lib/types";
import { newsItems as placeholder } from "@/content/news";
import { useLang } from "@/components/lang-provider";
import { useEffect, useState } from "react";
import { getPosts } from "../lib/actions/api/news/news-actions";


export function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [i, setI] = useState(0)
  const { lang, t } = useLang();
  const locale = lang === "ar" ? "ar-EG" : "en-US";
  useEffect(()=>{
      const intialLoad = async ()=>{
      const  data : {items : NewsItem[], warning? : string} = await getPosts()
      const entries = data.items?.length ? data.items : placeholder;
      setNews(entries)
      }
      intialLoad()


    },[])

  useEffect(() => {
    if (news.length <= 1) return;
    const timer = setInterval(() => setI((n) => (n + 1) % news.length), 6000);
    return () => clearInterval(timer);
  }, [news.length]);

  if (news.length === 0) return null;

  return (
    <section id="news" className="relative border-b bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-4 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{t("news")}</h2>
        </div>
        <div className="relative h-[280px] w-full overflow-hidden rounded-2xl border bg-card shadow-sm sm:h-[360px] md:h-[420px]">
          {news.map((n, idx) => {
            const title = n.title;
            const body = n.body;
            const linkLabel = n.linkLabel ?? "Learn more";
            const date = new Date(n.publishedAt).toLocaleDateString(locale, {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return (
              <article
                key={n.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  idx === i ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                {n.imageUrl ? (
                  <div className="relative h-full w-full">
                    <img
                      src={n.imageUrl}
                      alt={title}
                      className="washed h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                      <div className="text-xs uppercase tracking-wider text-white/70">
                        {date}
                      </div>
                      <h3 className="mt-1 text-2xl font-bold sm:text-3xl">{title}</h3>
                      {body && (
                        <p className="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">
                          {body}
                        </p>
                      )}
                      {n.linkUrl && (
                        <a
                          href={n.linkUrl}
                          target={n.linkUrl.startsWith("http") ? "_blank" : undefined}
                          rel="noreferrer"
                          className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                          {linkLabel}
                          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full w-full flex-col justify-center overflow-y-auto p-6 sm:p-8">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {date}
                    </div>
                    <h3 className="mt-1 text-2xl font-bold">{title}</h3>
                    {body && <p className="mt-2 text-muted-foreground">{body}</p>}
                    {n.linkUrl && (
                      <a
                        href={n.linkUrl}
                        target={n.linkUrl.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                        className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        {linkLabel}
                        <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                      </a>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
        {news.length > 1 && (
          <div className="mt-3 flex justify-center gap-2">
            {news.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 w-6 rounded-full transition-all ${
                  idx === i ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
