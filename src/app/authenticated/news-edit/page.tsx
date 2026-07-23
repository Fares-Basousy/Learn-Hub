'use client'
import { useEffect, useState } from "react";
import { NewsItem } from "@/src/lib/types";
import { createPost, deletePost, getPosts, updatePost } from "@/src/lib/actions/api/news/news-actions";
export type Form = {
  title: string;
  title_ar: string;
  body: string;
  body_ar: string;
  image_url: string;
  link_url: string;
  link_label: string;
  link_label_ar: string;
};

const emptyForm: Form = {
  title: "",
  title_ar: "",
  body: "",
  body_ar: "",
  image_url: "",
  link_url: "",
  link_label: "",
  link_label_ar: "",
};

function toBody(f: Form) {
  const clean = (v: string) => (v.trim() === "" ? null : v.trim());
  return {
    title: f.title.trim(),
    title_ar: clean(f.title_ar),
    body: clean(f.body),
    body_ar: clean(f.body_ar),
    image_url: clean(f.image_url),
    link_url: clean(f.link_url),
    link_label: clean(f.link_label),
    link_label_ar: clean(f.link_label_ar),
  };
}

export default function NewsEditPage() {
  // const qc = useQueryClient();
  // const { data, error } = useQuery({
  //   queryKey: ["news"],
  //   queryFn: () => api<{ items: NewsItem[] }>("/api/news"),
  //   retry: false,
  // });
  const [news, setNews] = useState<NewsItem[]>([])
  const [form, setForm] = useState<Form>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<Error>()
  const [pending, setPending] = useState(false)
  const [refresh, setRefresh] = useState(false)
useEffect(()=>{
          const Load = async ()=>{
              try{
                const  data  = await getPosts()
                const entries : NewsItem[] = data?.items.length ? data.items : [];
                setNews((prev : NewsItem[])=>[...prev,...entries])
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              catch(e : any){
                setError(e)
              }
              }
              Load()
        },[refresh]) 
  const create =  async () =>{
      try{
          setPending(true)
          const formData = new FormData();
          Object.entries(toBody(form)).forEach(([key, value]) => {
            if(key != 'id')
              formData.append(key, String(value));
            });
          await createPost(formData).then(async ()=>{
            setPending(false)
            setForm(emptyForm)
            setRefresh(!refresh)
          })
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch(error : any){
              setPending(false)
              setError(error)
              console.log(error)      
          }
    }
  // useMutation({
  //   mutationFn: () =>
  //     api("/api/news", { method: "POST", body: JSON.stringify(toBody(toBody(form))) }),
  //   onSuccess: () => {
  //     qc.invalidateQueries({ queryKey: ["news"] });
  //     qc.invalidateQueries({ queryKey: ["news-public"] });
  //     setForm(emptyForm);
  //   },
  // });

  const update =  async (id : string) =>{
      try{
          setPending(true)
          const formData = new FormData();
          Object.entries(toBody(form)).forEach(([key, value]) => {
            
            formData.append(key, String(value));
            });
          await updatePost(formData,id).then(async ()=>{
            setPending(false)
            setForm(emptyForm)
            setRefresh(!refresh)
          })
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch(error : any){
              setPending(false)
              setError(error)
              console.log(error)      
          }
    }

  const remove =  async (id : string) =>{
      try{
          setPending(true)
          setPending(false)

          await deletePost(id).then(async ()=>{
            setPending(false)
            setRefresh(!refresh)
          })
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch(error : any){
              setError(error)
              setPending(false)
              console.log(error)      
          }
    }

  function startEdit(n: NewsItem) {
    setEditingId(n.id);
    setForm({
      title: n.title ?? "",
      title_ar: n.title_ar ?? "",
      body: n.body ?? "",
      body_ar: n.body_ar ?? "",
      image_url: n.image_url ?? "",
      link_url: n.link_url ?? "",
      link_label: n.link_label ?? "",
      link_label_ar: n.link_label_ar ?? "",
    });
  }

  const inputCls = "h-9 w-full rounded-md border border-input bg-background px-2 text-sm";

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold">News</h1>
      <p className="text-sm text-muted-foreground">
        Editable news hero shown at the top of the landing page.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
         if (editingId) 
          update(editingId);
         else
          create()
        }}
        className="mt-6 grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2">
        <label className="text-xs font-medium sm:col-span-2">
          Title (EN)
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputCls}
          />
        </label>
        <label className="text-xs font-medium sm:col-span-2">
          Title (AR)
          <input
            value={form.title_ar}
            onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
            className={inputCls}
            dir="rtl"
          />
        </label>
        <label className="text-xs font-medium sm:col-span-2">
          Body (EN)
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="min-h-[70px] w-full rounded-md border border-input bg-background p-2 text-sm"
          />
        </label>
        <label className="text-xs font-medium sm:col-span-2">
          Body (AR)
          <textarea
            value={form.body_ar}
            onChange={(e) => setForm({ ...form, body_ar: e.target.value })}
            className="min-h-[70px] w-full rounded-md border border-input bg-background p-2 text-sm"
            dir="rtl"
          />
        </label>
        <label className="text-xs font-medium sm:col-span-2">
          Image URL
          <input
            type="url"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className={inputCls}
            placeholder="https://…"
          />
        </label>
        <label className="text-xs font-medium sm:col-span-2">
          Link URL
          <input
            type="url"
            value={form.link_url}
            onChange={(e) => setForm({ ...form, link_url: e.target.value })}
            className={inputCls}
            placeholder="https://…"
          />
        </label>
        <label className="text-xs font-medium">
          Link label (EN)
          <input
            value={form.link_label}
            onChange={(e) => setForm({ ...form, link_label: e.target.value })}
            className={inputCls}
            placeholder="Learn more"
          />
        </label>
        <label className="text-xs font-medium">
          Link label (AR)
          <input
            value={form.link_label_ar}
            onChange={(e) => setForm({ ...form, link_label_ar: e.target.value })}
            className={inputCls}
            placeholder="اعرف المزيد"
            dir="rtl"
          />
        </label>

        <div className="flex items-center gap-2 sm:col-span-2">
          <button className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {editingId ? "Save changes" : "Add news"}
          </button>
          {editingId && (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="h-9 rounded-md border border-input px-3 text-sm hover:bg-accent"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {(error) && (
        <p className="mt-2 text-sm text-destructive">
          {(error as Error)?.message ??
          (error as Error)?.message}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {(news ?? []).map((n) => (
          <div key={n.id} className="flex gap-3 rounded-lg border bg-card p-3">
            {n.image_url && (
              <img
                src={n.image_url}
                alt=""
                className="h-16 w-24 shrink-0 rounded object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{n.title}</div>
               {n.link_url && (
                <a
                  href={n.link_url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-xs text-primary hover:underline"
                >
                  {n.link_url}
                </a>
               )} 
             </div>
             <div className="flex shrink-0 items-start gap-2">
               <button
                 onClick={() => startEdit(n)}
                 className="text-xs text-primary hover:underline"
               >
                 Edit
               </button>
               <button
                 onClick={() => remove(n.id)}
                 className="text-xs text-destructive hover:underline"
               >
                 Delete
               </button>
             </div>
           </div>
         ))}
        {news && news?.length === 0 && (
          <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
            No news items yet.
          </div>
        )}
      </div>
    </div>
  );
}


