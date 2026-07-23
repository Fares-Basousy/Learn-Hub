/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { adjustInventory, getOrganizationsAdmin } from "@/src/lib/actions/api/organizations/organizations-actions";
import { Organization } from "@/src/lib/types";




export default function InventoryPage() {
  const [organizations, setOrganization] = useState<Organization[]>([])
  const [error, setError] = useState<Error>()
  const [refresh, setRefresh] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  
    useEffect(()=>{
          const Load = async ()=>{
              try{
                const  data  = await getOrganizationsAdmin()
                const parsedData = await data.organizations
                const entries : Organization[] = parsedData?.length ? parsedData : [];
                setOrganization((prev : Organization[])=>[...prev,...entries])
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              catch(e : any){
                setError(e)
              }
              }
              Load()
        },[pageIndex,refresh])
 

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">Inventory</h1>
      <p className="text-sm text-muted-foreground">
        Adjust book and code counts per organization.
      </p>

      {organizations && (
        <p className="mt-4 text-sm text-destructive">{(error as Error).message}</p>
      )}

      <div className="mt-6 grid gap-3">
        {organizations?.map((o) => (
          <OrgRow key={o.id} org={o} onSaved={() => setRefresh((prev)=>!prev)}  />
        ))}
        <button
            onClick={() => setPageIndex((prev)=> prev+1)}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Next
          </button>
        {organizations && organizations?.length === 0 && (
          <p className="text-sm text-muted-foreground">No organizations yet.</p>
        )}
      </div>
    </div>
  );
}

function OrgRow({ org, onSaved }: { org: Organization; onSaved: () => void }) {
  const [books, setBooks] = useState(0);
  const [codes, setCodes] = useState(0);
  const [pending, setPending] = useState(false)
const adjust = async ()=>{
      try{
        setPending(true)
        const formData = new FormData();
          formData.append('id', org.id);
          formData.append('booksDelta', String(books));
          formData.append('codesDelta', String(codes));


        await adjustInventory(formData).then(()=>{
          setPending(false)
          setBooks(0);
          setCodes(0);
          onSaved();
          //give notification
          })
      }
      catch(error : any){
        console.log(error)
  
    }
  }
  

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
      <div className="flex-1">
        <div className="font-semibold">{org.name}</div>
        <div className="text-xs text-muted-foreground">
          {org.books_count} books · {org.codes_count} codes
        </div>
      </div>
      <label className="text-xs text-muted-foreground">
        Δ books
        <input
          type="number"
          value={books}
          onChange={(e) => setBooks(Number(e.target.value))}
          className="ml-2 h-8 w-20 rounded-md border border-input bg-background px-2 text-sm"
        />
      </label>
      <label className="text-xs text-muted-foreground">
        Δ codes
        <input
          type="number"
          value={codes}
          onChange={(e) => setCodes(Number(e.target.value))}
          className="ml-2 h-8 w-20 rounded-md border border-input bg-background px-2 text-sm"
        />
      </label>
      <button
        onClick={() => adjust()}
        disabled={pending || (books === 0 && codes === 0)}
        className="h-8 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        Apply
      </button>
    </div>
  );
}
