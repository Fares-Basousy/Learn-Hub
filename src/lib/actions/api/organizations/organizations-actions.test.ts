import { prismaMock } from "@/test/prisma-mock";
import {
  createOrganization,
  moveOrganizationOrder,
  restockInventory,
} from "@/lib/actions/api/organizations/organizations-actions";

function makeFormData(fields: Record<string, string>) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

const baseOrg = {
  id: "org-1",
  name: "Test Org",
  subject: "Math",
  picUrl: "https://example.com/pic.png",
  displayOrder: 0,
  createdAt: new Date(),
};

describe("createOrganization", () => {
  it("places a new organization after the current max displayOrder", async () => {
    prismaMock.organization.aggregate.mockResolvedValue({
      _max: { displayOrder: 4 },
    } as never);
    prismaMock.organization.create.mockResolvedValue({ ...baseOrg, displayOrder: 5 });

    await createOrganization(
      makeFormData({ name: "New Org", subject: "Science", picUrl: "https://example.com/a.png" }),
    );

    expect(prismaMock.organization.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ displayOrder: 5 }) }),
    );
  });

  it("starts at 0 when there are no existing organizations", async () => {
    prismaMock.organization.aggregate.mockResolvedValue({
      _max: { displayOrder: null },
    } as never);
    prismaMock.organization.create.mockResolvedValue({ ...baseOrg, displayOrder: 0 });

    await createOrganization(
      makeFormData({ name: "First Org", subject: "Science", picUrl: "https://example.com/a.png" }),
    );

    expect(prismaMock.organization.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ displayOrder: 0 }) }),
    );
  });
});

describe("moveOrganizationOrder", () => {
  it("swaps displayOrder with the previous neighbor when moving up", async () => {
    const current = { ...baseOrg, id: "org-2", displayOrder: 3 };
    const neighbor = { ...baseOrg, id: "org-1", displayOrder: 2 };
    prismaMock.organization.findUniqueOrThrow.mockResolvedValue(current);
    prismaMock.organization.findFirst.mockResolvedValue(neighbor);
    prismaMock.$transaction.mockResolvedValue([current, neighbor] as never);

    await moveOrganizationOrder("org-2", "up");

    expect(prismaMock.organization.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { displayOrder: { lt: 3 } },
        orderBy: { displayOrder: "desc" },
      }),
    );
    // The moved org takes the neighbor's old position and vice versa.
    expect(prismaMock.organization.update).toHaveBeenCalledWith({
      where: { id: "org-2" },
      data: { displayOrder: 2 },
    });
    expect(prismaMock.organization.update).toHaveBeenCalledWith({
      where: { id: "org-1" },
      data: { displayOrder: 3 },
    });
  });

  it("swaps displayOrder with the next neighbor when moving down", async () => {
    const current = { ...baseOrg, id: "org-1", displayOrder: 0 };
    const neighbor = { ...baseOrg, id: "org-2", displayOrder: 1 };
    prismaMock.organization.findUniqueOrThrow.mockResolvedValue(current);
    prismaMock.organization.findFirst.mockResolvedValue(neighbor);

    await moveOrganizationOrder("org-1", "down");

    expect(prismaMock.organization.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { displayOrder: { gt: 0 } },
        orderBy: { displayOrder: "asc" },
      }),
    );
  });

  it("is a no-op when already at the edge (no neighbor found)", async () => {
    const current = { ...baseOrg, id: "org-1", displayOrder: 0 };
    prismaMock.organization.findUniqueOrThrow.mockResolvedValue(current);
    prismaMock.organization.findFirst.mockResolvedValue(null);

    const result = await moveOrganizationOrder("org-1", "up");

    expect(result).toEqual({ ok: true });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});

describe("restockInventory", () => {
  beforeEach(() => {
    prismaMock.$transaction.mockImplementation((cb) =>
      typeof cb === "function" ? cb(prismaMock) : Promise.resolve(cb),
    );
    prismaMock.organization.findUnique.mockResolvedValue({
      ...baseOrg,
      inventory: [],
      bookInventory: [],
    } as never);
  });

  it("adds codes via upsert, incrementing existing counts", async () => {
    prismaMock.organizationInventory.upsert.mockResolvedValue({
      id: "inv-1",
      orgId: "org-1",
      grade: 10,
      codesCount: 5,
    });

    await restockInventory("org-1", makeFormData({ grade: "10", codesCount: "5", booksCount: "0" }));

    expect(prismaMock.organizationInventory.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orgId_grade: { orgId: "org-1", grade: 10 } },
        create: { orgId: "org-1", grade: 10, codesCount: 5 },
        update: { codesCount: { increment: 5 } },
      }),
    );
    expect(prismaMock.bookInventory.upsert).not.toHaveBeenCalled();
  });

  it("creates a new book edition when newEditionName is given instead of editionId", async () => {
    prismaMock.bookEdition.upsert.mockResolvedValue({
      id: "edition-new",
      name: "Chapter 9",
      createdAt: new Date(),
    });
    prismaMock.bookInventory.upsert.mockResolvedValue({
      id: "bi-1",
      orgId: "org-1",
      grade: 10,
      editionId: "edition-new",
      count: 3,
    });

    await restockInventory(
      "org-1",
      makeFormData({ grade: "10", codesCount: "0", booksCount: "3", newEditionName: "Chapter 9" }),
    );

    expect(prismaMock.bookEdition.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { name: "Chapter 9" } }),
    );
    expect(prismaMock.bookInventory.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orgId_grade_editionId: { orgId: "org-1", grade: 10, editionId: "edition-new" } },
        update: { count: { increment: 3 } },
      }),
    );
  });

  it("rejects when neither books nor codes are provided", async () => {
    await expect(restockInventory("org-1", makeFormData({ grade: "10", codesCount: "0", booksCount: "0" }))).rejects.toThrow();
  });

  it("rejects books without an edition selection", async () => {
    await expect(
      restockInventory("org-1", makeFormData({ grade: "10", codesCount: "0", booksCount: "3" })),
    ).rejects.toThrow();
  });
});
