/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { createSale } from "@/src/lib/actions/api/sales/sales-actions";
import { createStudent } from "@/src/lib/actions/api/students/student-actions";
import { getOrganizationsAdmin } from "@/src/lib/actions/api/organizations/organizations-actions";



type Org = { id: string; name: string };
type ItemType = "book" | "code" | "other";
type Item = { type: ItemType; count: number };

export default function NewSalePage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([])
  const [orgId, setOrgId] = useState("");
  const [items, setItems] = useState<Item[]>([{ type: "book", count: 1 }]);
  // Optional student data — see plan.
  const [studentName, setStudentName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [saveStudent, setSaveStudent] = useState(false);
  const [pending, setPending] = useState(false)
  const [error, setError] = useState()
  useEffect(()=>{
        const intialLoad = async ()=>{
            try{
              const  data  = await getOrganizationsAdmin()
              const entries = data.organizations?.length ? data.organizations : [];
              setOrgs(entries)
            }
            catch(e : any){
              setError(e)
            }
            }
            intialLoad()
      },[])
  const submit = async ()=>{
    try{
        setPending(true)
        const orgFormData = new FormData();
        const studentFormData = new FormData();
        orgFormData.append('org_id', orgId);
        orgFormData.append('items', JSON.stringify(items))
        await createSale(orgFormData).then(async ()=>{
          if (saveStudent && studentName) {
          studentFormData.append('org_id', orgId);
          studentFormData.append('name', studentName);
          studentFormData.append('student_number', studentNumber);
          studentFormData.append('grade', grade);
          studentFormData.append('school', school);
          await createStudent(studentFormData)}
          router.push('/sales')
        })
      }
    catch(error : any){
            setError(error)
            console.log(error)      
        }
  }
 
  

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">New sale</h1>
      <p className="text-sm text-muted-foreground">
        Record a sale. Deducts from the organization&apos;s inventory in the same transaction.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="mt-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium">Organization</label>
          <select
            required
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select…</option>
            {orgs?.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Items</label>
          <div className="mt-2 space-y-2">
            {items.map((it, idx) => (
              <div key={idx} className="flex gap-2">
                <select
                  value={it.type}
                  onChange={(e) =>
                    setItems((xs) =>
                      xs.map((x, i) =>
                        i === idx ? { ...x, type: e.target.value as ItemType } : x,
                      ),
                    )
                  }
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option value="book">Book</option>
                  <option value="code">Code</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="number"
                  min={1}
                  value={it.count}
                  onChange={(e) =>
                    setItems((xs) =>
                      xs.map((x, i) =>
                        i === idx ? { ...x, count: Number(e.target.value) } : x,
                      ),
                    )
                  }
                  className="h-9 w-24 rounded-md border border-input bg-background px-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setItems((xs) => xs.filter((_, i) => i !== idx))}
                  className="h-9 rounded-md border px-3 text-sm"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setItems((xs) => [...xs, { type: "book", count: 1 }])}
              className="text-sm text-primary hover:underline"
            >
              + Add item
            </button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={saveStudent}
              onChange={(e) => setSaveStudent(e.target.checked)}
            />
            Also save student info (optional)
          </label>
          {saveStudent && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input
                placeholder="Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
              <input
                placeholder="Student #"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
              <input
                placeholder="Grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
              <input
                placeholder="School"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive">{(error as Error).message}</p>
        )}

        <button
          type="submit"
          disabled={!orgId || items.length === 0 || pending}
          className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Record sale"}
        </button>
      </form>
    </div>
  );
}
