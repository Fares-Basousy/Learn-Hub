import { Grades, Student } from "../lib/types";
import { useState } from "react";
import toast from "react-hot-toast";
import { deleteStudent, updateStudent } from "@/src/lib/actions/api/students/student-actions";
import { useLang } from "@/components/lang-provider";

type StudentRowProps = {
  student: Student;
  onDelete: (id: string) => void;
  onUpdate: (updated: Student) => void;
};

export default function StudentRow({ student, onDelete, onUpdate }: StudentRowProps) {
  const { t } = useLang();
  const [pending, setPending] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    name: student.name,
    number: student.number,
    grade: student.grade,
    school: student.school,
  })

  const remove = async (id : string)=>{
    setPending(true)
    try{
      await toast.promise(deleteStudent(id), {
        loading: "Deleting student…",
        success: "Student deleted",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (e: any) => e.message ?? "Failed to delete student",
      })
      onDelete(id)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch(error : any){
      console.log(error)
    }
    finally {
      setPending(false)
    }
  }
  const update = async (id : string)=>{
    setPending(true)
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    try{
      const { student: updated } = await toast.promise(updateStudent(id, formData), {
        loading: "Saving…",
        success: "Student updated",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (e: any) => e.message ?? "Failed to update student",
      })
      setIsEditing(false)
      onUpdate(updated)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch(error : any){
      console.log(error)
    }
    finally {
      setPending(false)
    }
  }

  const cancel = () => {
    setForm({
      name: student.name,
      number: student.number,
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
                        value={form.number}
                        onChange={(e) => setForm({ ...form, number: e.target.value })}
                        className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={form.grade}
                        onChange={(e) => setForm({ ...form, grade: Number(e.target.value) })}
                        className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                      >
                        {Object.entries(Grades).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
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
                    <td className="p-2">{student.number}</td>
                    <td className="p-2">{Grades[student.grade as keyof typeof Grades] ?? student.grade}</td>
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
                        {t("save")}
                      </button>
                      <button
                        disabled={pending}
                        onClick={cancel}
                        className="ml-2 text-xs text-muted-foreground hover:underline disabled:opacity-50"
                      >
                        {t("cancel")}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs text-muted-foreground hover:underline"
                      >
                        {t("edit")}
                      </button>
                      <button
                       disabled={pending}
                       onClick={() => remove(student.id)}
                        className="ml-2 text-xs text-destructive hover:underline disabled:opacity-50"
                      >
                        {t("delete")}
                      </button>
                    </>
                  )}
                </td>
              </tr>
)}
