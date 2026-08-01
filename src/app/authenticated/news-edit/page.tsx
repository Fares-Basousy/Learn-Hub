'use client'
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { NewsItem } from "@/src/lib/types";
import { createPost, deletePost, getPosts, updatePost } from "@/src/lib/actions/api/news/news-actions";
export type Form = {
  title: string;
  body: string;
  imageUrl: string;
  linkUrl: string;
  linkLabel: string;
};

const emptyForm: Form = {
  title: "",
  body: "",
  imageUrl: "",
  linkUrl: "",
  linkLabel: "",
};

function toBody(f: Form) {
  const clean = (v: string) => (v.trim() === "" ? null : v.trim());
  return {
    title: f.title.trim(),
    body: clean(f.body),
    imageUrl: clean(f.imageUrl),
    linkUrl: clean(f.linkUrl),
    linkLabel: clean(f.linkLabel),
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
  const [pending, setPending] = useState(false)
  const [refresh, setRefresh] = useState(false)
useEffect(()=>{
          const Load = async ()=>{
              try{
                const  data  = await getPosts()
                setNews(data?.items ?? [])
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              catch(e : any){
                toast.error(e.message ?? "Failed to load news")
              }
              }
              Load()
        },[refresh])
  const create =  async () =>{
      setPending(true)
      const formData = new FormData();
      Object.entries(toBody(form)).forEach(([key, value]) => {
        if (key !== 'id' && value !== null) formData.append(key, String(value));
        });
      try{
          await toast.promise(createPost(formData), {
            loading: "Adding news…",
            success: "News added",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            error: (e: any) => e.message ?? "Failed to add news",
          })
          setForm(emptyForm)
          setRefresh(!refresh)
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch(error : any){
              console.log(error)
          }
      finally {
        setPending(false)
      }
    }

  const update =  async (id : string) =>{
      setPending(true)
      const formData = new FormData();
      Object.entries(toBody(form)).forEach(([key, value]) => {
        if (value !== null) formData.append(key, String(value));
        });
      try{
          await toast.promise(updatePost(formData, id), {
            loading: "Saving…",
            success: "News updated",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            error: (e: any) => e.message ?? "Failed to update news",
          })
          setForm(emptyForm)
          setRefresh(!refresh)
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch(error : any){
              console.log(error)
          }
      finally {
        setPending(false)
      }
    }

  const remove =  async (id : string) =>{
      setPending(true)
      try{
          await toast.promise(deletePost(id), {
            loading: "Deleting news…",
            success: "News deleted",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            error: (e: any) => e.message ?? "Failed to delete news",
          })
          setRefresh(!refresh)
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch(error : any){
              console.log(error)
          }
      finally {
        setPending(false)
      }
    }

  function startEdit(n: NewsItem) {
    setEditingId(n.id);
    setForm({
      title: n.title ?? "",
      body: n.body ?? "",
      imageUrl: n.imageUrl ?? "",
      linkUrl: n.linkUrl ?? "",
      linkLabel: n.linkLabel ?? "",
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
          Title
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputCls}
          />
        </label>
        <label className="text-xs font-medium sm:col-span-2">
          Body
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="min-h-[70px] w-full rounded-md border border-input bg-background p-2 text-sm"
          />
        </label>
        <label className="text-xs font-medium sm:col-span-2">
          Image URL
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className={inputCls}
            placeholder="https://…"
          />
        </label>
        <label className="text-xs font-medium sm:col-span-2">
          Link URL
          <input
            type="url"
            value={form.linkUrl}
            onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
            className={inputCls}
            placeholder="https://…"
          />
        </label>
        <label className="text-xs font-medium">
          Link label
          <input
            value={form.linkLabel}
            onChange={(e) => setForm({ ...form, linkLabel: e.target.value })}
            className={inputCls}
            placeholder="Learn more"
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

      <div className="mt-6 space-y-3">
        {(news ?? []).map((n) => (
          <div key={n.id} className="flex gap-3 rounded-lg border bg-card p-3">
            {n.imageUrl && (
              <img
                src={n.imageUrl}
                alt=""
                className="h-16 w-24 shrink-0 rounded object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{n.title}</div>
               {n.linkUrl && (
                <a
                  href={n.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-xs text-primary hover:underline"
                >
                  {n.linkUrl}
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


