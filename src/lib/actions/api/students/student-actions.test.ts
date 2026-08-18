import { prismaMock } from "@/test/prisma-mock";
import { createStudent, updateStudent } from "@/lib/actions/api/students/student-actions";

function makeFormData(fields: Record<string, string | string[]>) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach((item) => fd.append(k, item));
    else fd.append(k, v);
  });
  return fd;
}

const org1 = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Org 1",
  subject: "Math",
  picUrl: "",
  displayOrder: 0,
  createdAt: new Date(),
};
const org2 = {
  id: "22222222-2222-2222-2222-222222222222",
  name: "Org 2",
  subject: "Science",
  picUrl: "",
  displayOrder: 1,
  createdAt: new Date(),
};

const baseStudent = {
  id: "student-1",
  name: "Ahmed",
  number: "STU-1",
  grade: 10,
  school: "Al-Noor",
  type: null,
  gender: "MALE" as const,
  createdAt: new Date(),
};

describe("createStudent", () => {
  it("can be created with zero organizations", async () => {
    prismaMock.student.create.mockResolvedValue({ ...baseStudent, organizations: [] } as never);

    const { student } = await createStudent(
      makeFormData({ name: "Ahmed", number: "STU-1", grade: "10", school: "Al-Noor", gender: "MALE" }),
    );

    expect(prismaMock.student.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ organizations: { create: [] } }),
      }),
    );
    expect(student.organizations).toEqual([]);
  });

  it("creates membership rows for every submitted org", async () => {
    prismaMock.student.create.mockResolvedValue({
      ...baseStudent,
      organizations: [{ org: org1 }, { org: org2 }],
    } as never);

    const { student } = await createStudent(
      makeFormData({
        name: "Ahmed",
        number: "STU-1",
        grade: "10",
        school: "Al-Noor",
        gender: "MALE",
        orgIds: [org1.id, org2.id],
      }),
    );

    expect(prismaMock.student.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizations: { create: [{ orgId: org1.id }, { orgId: org2.id }] },
        }),
      }),
    );
    // flattenStudent unwraps the join rows to plain orgs for the UI.
    expect(student.organizations).toEqual([org1, org2]);
  });
});

describe("updateStudent", () => {
  it("leaves org memberships untouched when orgIdsTouched is not sent", async () => {
    prismaMock.student.update.mockResolvedValue({ ...baseStudent, name: "Ahmed Updated", organizations: [] } as never);

    await updateStudent("student-1", makeFormData({ name: "Ahmed Updated" }));

    const callArgs = prismaMock.student.update.mock.calls[0][0];
    expect(callArgs.data).not.toHaveProperty("organizations");
  });

  it("clears all memberships when orgIdsTouched is sent with no orgIds", async () => {
    // Regression case: naively checking `orgIds.length` instead of an explicit
    // "touched" flag would make it impossible to unassign every organization,
    // since an empty array is indistinguishable from "field not submitted".
    prismaMock.student.update.mockResolvedValue({ ...baseStudent, organizations: [] } as never);

    await updateStudent("student-1", makeFormData({ orgIdsTouched: "1" }));

    expect(prismaMock.student.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizations: { deleteMany: {}, create: [] },
        }),
      }),
    );
  });

  it("replaces org memberships when orgIdsTouched is sent with new orgIds", async () => {
    prismaMock.student.update.mockResolvedValue({ ...baseStudent, organizations: [{ org: org2 }] } as never);

    await updateStudent("student-1", makeFormData({ orgIdsTouched: "1", orgIds: [org2.id] }));

    expect(prismaMock.student.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizations: { deleteMany: {}, create: [{ orgId: org2.id }] },
        }),
      }),
    );
  });
});
