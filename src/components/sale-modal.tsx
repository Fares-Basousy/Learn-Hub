"use client"
import { useState } from "react";
import toast from "react-hot-toast";
import { createSale } from "@/src/lib/actions/api/sales/sales-actions";
import { createStudent } from "@/src/lib/actions/api/students/student-actions";
import { Gender, Grades, Organization } from "@/src/lib/types";

type SaleItemInput = { codesCount: string; booksCount: string; orgId: string; grade: string };

const emptyItem = (): SaleItemInput => ({ codesCount: "0", booksCount: "0", orgId: "", grade: "" });

export default function SaleModal({
  organizations,
  onClose,
  onCreated,
}: {
  organizations: Organization[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [items, setItems] = useState<SaleItemInput[]>([emptyItem()]);
  const [addStudent, setAddStudent] = useState(false);
  const [student, setStudent] = useState({
    orgId: "",
    name: "",
    number: "",
    grade: "",
    school: "",
    gender: "MALE" as Gender,
  });
  const [pending, setPending] = useState(false);

  const updateItem = (idx: number, patch: Partial<SaleItemInput>) => {
    setItems((xs) => xs.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  };

  const validItems = items.every(
    (i) => i.orgId && Number(i.grade) > 0 && (Number(i.codesCount) > 0 || Number(i.booksCount) > 0),
  );
  const validStudent = !addStudent || (student.orgId && student.name && student.number && student.grade && student.school);

  const submit = async () => {
    setPending(true);
    const formData = new FormData();
    formData.append(
      "items",
      JSON.stringify(
        items.map((i) => ({
          orgId: i.orgId,
          grade: Number(i.grade),
          booksCount: Number(i.booksCount) || 0,
          codesCount: Number(i.codesCount) || 0,
        })),
      ),
    );

    const run = async () => {
      await createSale(formData);

      if (addStudent) {
        const studentFormData = new FormData();
        studentFormData.append("orgId", student.orgId);
        studentFormData.append("name", student.name);
        studentFormData.append("number", student.number);
        studentFormData.append("grade", student.grade);
        studentFormData.append("school", student.school);
        studentFormData.append("gender", student.gender);
        await createStudent(studentFormData);
      }
    };

    try {
      await toast.promise(run(), {
        loading: "Recording sale…",
        success: "Sale recorded",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (e: any) => e.message ?? "Failed to record sale",
      });
      onCreated();
      onClose();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (e: any) {
      console.log(e);
    }
    finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="h-full w-full overflow-y-auto rounded-none border-0 bg-card p-4 shadow-lg sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-lg sm:border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">New sale</h2>
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-2 rounded-md border p-2">
              <label className="text-xs text-muted-foreground">
                Codes
                <input
                  type="number"
                  min={0}
                  value={item.codesCount}
                  onChange={(e) => updateItem(idx, { codesCount: e.target.value })}
                  className="ml-2 h-9 w-20 rounded-md border border-input bg-background px-2 text-sm"
                />
              </label>
              <label className="text-xs text-muted-foreground">
                Books
                <input
                  type="number"
                  min={0}
                  value={item.booksCount}
                  onChange={(e) => updateItem(idx, { booksCount: e.target.value })}
                  className="ml-2 h-9 w-20 rounded-md border border-input bg-background px-2 text-sm"
                />
              </label>
              <select
                value={item.orgId}
                onChange={(e) => updateItem(idx, { orgId: e.target.value })}
                className="h-9 min-w-0 max-w-full flex-1 rounded-md border border-input bg-background px-2 text-sm sm:flex-none"
              >
                <option value="">Org…</option>
                {organizations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              <label className="text-xs text-muted-foreground">
                Grade
                <select
                  value={item.grade}
                  onChange={(e) => updateItem(idx, { grade: e.target.value })}
                  className="ml-2 h-9 rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option value="">Grade…</option>
                  {Object.entries(Grades).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => setItems((xs) => xs.filter((_, i) => i !== idx))}
                  className="ml-auto h-9 rounded-md border px-3 text-sm"
                >
                  −
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setItems((xs) => [...xs, emptyItem()])}
            className="flex h-9 items-center gap-1 text-sm text-primary hover:underline"
          >
            + Sell to another org
          </button>
        </div>

        <div className="mt-4 rounded-lg border bg-muted/30 p-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={addStudent} onChange={(e) => setAddStudent(e.target.checked)} />
            Also register a new student for this sale (optional)
          </label>
          {addStudent && (
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <select
                value={student.orgId}
                onChange={(e) => setStudent({ ...student, orgId: e.target.value })}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="">Org…</option>
                {organizations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              <select
                value={student.gender}
                onChange={(e) => setStudent({ ...student, gender: e.target.value as Gender })}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
              <input
                placeholder="Name"
                value={student.name}
                onChange={(e) => setStudent({ ...student, name: e.target.value })}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
              <input
                placeholder="Student #"
                value={student.number}
                onChange={(e) => setStudent({ ...student, number: e.target.value })}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
              <select
                value={student.grade}
                onChange={(e) => setStudent({ ...student, grade: e.target.value })}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Grade…</option>
                {Object.entries(Grades).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                placeholder="School"
                value={student.school}
                onChange={(e) => setStudent({ ...student, school: e.target.value })}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="h-9 rounded-md px-3 text-sm text-muted-foreground hover:bg-accent">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={pending || !validItems || !validStudent}
            className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Record sale"}
          </button>
        </div>
      </div>
    </div>
  );
}
