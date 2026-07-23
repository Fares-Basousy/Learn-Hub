"use client"
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { createStudent, deleteStudent, getStudents } from "@/src/lib/actions/api/students/student-actions";
import { getOrganizationsAdmin } from "@/src/lib/actions/api/organizations/organizations-actions";
import { Organization, Student } from "@/src/lib/types";


export default function StudentsPage() {
  // const qc = useQueryClient();
  // const students = useQuery({
  //   queryKey: ["students"],
  //   queryFn: () => api<{ students: Student[] }>("/api/students"),
  //   retry: false,
  // });
  // const orgs = useQuery({
  //   queryKey: ["organizations"],
  //   queryFn: () => api<{ organizations: Org[] }>("/api/organizations"),
  //   retry: false,
  // });
  const [students, setStudents] = useState<Student[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<Error>()
  const [form, setForm] = useState({
    org_id: "",
    name: "",
    student_number: "",
    grade: "",
    school: "",
  });
 useEffect(()=>{
      const intialLoad = async ()=>{
          try{
            const  studentsData  = await getStudents(pageIndex)
            const  organizationsData  = await getOrganizationsAdmin()

            setOrganizations(organizationsData.organizations)
            setStudents(studentsData.students)
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          catch(e : any){
            setError(e)
          }
          }
      const loadMore = async ()=>{
          try{
            const  studentsData  = await getStudents(pageIndex)
            setStudents((prev)=>[...prev,...studentsData.students])
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          catch(e : any){
            setError(e)
          }
          }
          if(pageIndex == 0)
          intialLoad()
          else
            loadMore()
    },[pageIndex])

  const create = async ()=>{
      try{
        setPending(true)
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
        if(key != 'id')
          formData.append(key, String(value));
        });
        await createStudent(formData).then(()=>{
          setForm({ org_id: "", name: "", student_number: "", grade: "", school: "" })
          setPending(false)
          //give notification
          })
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch(error : any){
        console.log(error)
        setError(error.message)
  
    }
  }
  const remove = async (id : string)=>{
      try{
        setPending(true)
        
        await deleteStudent(id).then(()=>{
          setPending(false)
          //give notification
          })
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch(error : any){
        console.log(error)
        setError(error.message)
  
    }
  }

// need to implemnt update
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">Students</h1>
      <p className="text-sm text-muted-foreground">Students associated with organizations.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
         create();
        }}
        className="mt-6 grid grid-cols-2 gap-2 rounded-lg border bg-card p-3 sm:grid-cols-6"
      >
        <select
          required
          value={form.org_id}
          onChange={(e) => setForm({ ...form, org_id: e.target.value })}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="">Org…</option>
          {organizations?.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        />
        <input
          required
          placeholder="Number"
          value={form.student_number}
          onChange={(e) => setForm({ ...form, student_number: e.target.value })}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        />
        <input
          required
          placeholder="Grade"
          value={form.grade}
          onChange={(e) => setForm({ ...form, grade: e.target.value })}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        />
        <input
          required
          placeholder="School"
          value={form.school}
          onChange={(e) => setForm({ ...form, school: e.target.value })}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        />
        <button className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Add
        </button>
      </form>

      {(error) && (
        <p className="mt-2 text-sm text-destructive">
          {(error as Error)?.message ?? (error as Error)?.message}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Number</th>
              <th className="p-2">Grade</th>
              <th className="p-2">School</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {(students ?? []).map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2 font-medium">{s.name}</td>
                <td className="p-2">{s.student_number}</td>
                <td className="p-2">{s.grade}</td>
                <td className="p-2">{s.school}</td>
                <td className="p-2 text-right">
                  <button
                   onClick={() => remove(s.id)}
                    className="text-xs text-destructive hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {students && students?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-muted-foreground">
                  No students yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
