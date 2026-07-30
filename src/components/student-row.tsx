import { Student } from "../lib/types";
import { useState } from "react";
import { deleteStudent, updateStudent } from "@/src/lib/actions/api/students/student-actions";

type StudentRowProps = {
  student: Student;
  onDelete: (id: string) => void;
  onUpdate: (updated: Student) => void;
};

export default function StudentRow({ student, onDelete, onUpdate }: StudentRowProps) {
  const [pending, setPending] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string>()
  const [form, setForm] = useState({
    name: student.name,
    student_number: student.student_number,
    grade: student.grade,
    school: student.school,
  })

  const remove = async (id : string)=>{
    try{
      setPending(true)

      await deleteStudent(id).then(()=>{
        setPending(false)
        onDelete(id)
        //give notification
        })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch(error : any){
      console.log(error)
      setPending(false)
      //setError(error.message)

  }
}
  const update = async (id : string)=>{
    try{
      setPending(true)

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      await updateStudent(Number(id), formData).then(({ student: updated })=>{
        setPending(false)
        setIsEditing(false)
        onUpdate(updated)
        //give notification
        })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch(error : any){
      console.log(error)
      setPending(false)
      setError(error.message)

  }
}

  const cancel = () => {
    setForm({
      name: student.name,
      student_number: student.student_number,
      grade: student.grade,
      school: student.school,
    })
    setIsEditing(false)
  }

    return (

              <tr key={student.id} className="border-t">
                {isEditing ? (
                  <>
                    <td className="p-2 font-medium">
                      <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={form.student_number}
                        onChange={(e) => setForm({ ...form, student_number: e.target.value })}
                        className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={form.grade}
                        onChange={(e) => setForm({ ...form, grade: e.target.value })}
                        className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={form.school}
                        onChange={(e) => setForm({ ...form, school: e.target.value })}
                        className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                      />
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-2 font-medium">{student.name}</td>
                    <td className="p-2">{student.student_number}</td>
                    <td className="p-2">{student.grade}</td>
                    <td className="p-2">{student.school}</td>
                  </>
                )}
                <td className="p-2 text-right whitespace-nowrap">
                  {isEditing ? (
                    <>
                      <button
                        disabled={pending}
                        onClick={() => update(student.id)}
                        className="text-xs text-primary hover:underline disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        disabled={pending}
                        onClick={cancel}
                        className="ml-2 text-xs text-muted-foreground hover:underline disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs text-muted-foreground hover:underline"
                      >
                        Edit
                      </button>
                      <button
                       disabled={pending}
                       onClick={() => remove(student.id)}
                        className="ml-2 text-xs text-destructive hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
                </td>
              </tr>
)}
