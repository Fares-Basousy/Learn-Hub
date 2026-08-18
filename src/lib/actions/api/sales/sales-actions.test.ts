import { prismaMock } from "@/test/prisma-mock";
import { createSale } from "@/lib/actions/api/sales/sales-actions";

function makeFormData(items: unknown[]) {
  const fd = new FormData();
  fd.append("items", JSON.stringify(items));
  return fd;
}

const orgId = "11111111-1111-1111-1111-111111111111";
const editionId = "22222222-2222-2222-2222-222222222222";

beforeEach(() => {
  prismaMock.$transaction.mockImplementation((cb) =>
    typeof cb === "function" ? cb(prismaMock) : Promise.resolve(cb),
  );
  prismaMock.sale.create.mockResolvedValue({
    id: "sale-1",
    userId: "user-1",
    soldAt: new Date(),
  } as never);
});

describe("createSale", () => {
  it("throws NOT_ENOUGH_CODES when requested codes exceed stock", async () => {
    prismaMock.organizationInventory.findUnique.mockResolvedValue({
      id: "inv-1",
      orgId,
      grade: 10,
      codesCount: 2,
    });

    await expect(
      createSale(makeFormData([{ orgId, grade: 10, codesCount: 5, booksCount: 0 }])),
    ).rejects.toThrow("NOT_ENOUGH_CODES");

    expect(prismaMock.organizationInventory.update).not.toHaveBeenCalled();
  });

  it("throws NOT_ENOUGH_CODES when there is no inventory row at all", async () => {
    prismaMock.organizationInventory.findUnique.mockResolvedValue(null);

    await expect(
      createSale(makeFormData([{ orgId, grade: 10, codesCount: 1, booksCount: 0 }])),
    ).rejects.toThrow("NOT_ENOUGH_CODES");
  });

  it("decrements codes inventory when enough stock is available", async () => {
    prismaMock.organizationInventory.findUnique.mockResolvedValue({
      id: "inv-1",
      orgId,
      grade: 10,
      codesCount: 10,
    });

    await createSale(makeFormData([{ orgId, grade: 10, codesCount: 4, booksCount: 0 }]));

    expect(prismaMock.organizationInventory.update).toHaveBeenCalledWith({
      where: { orgId_grade: { orgId, grade: 10 } },
      data: { codesCount: { decrement: 4 } },
    });
  });

  it("throws NOT_ENOUGH_BOOKS when requested books exceed stock", async () => {
    prismaMock.bookInventory.findUnique.mockResolvedValue({
      id: "bi-1",
      orgId,
      grade: 10,
      editionId,
      count: 1,
    });

    await expect(
      createSale(
        makeFormData([{ orgId, grade: 10, codesCount: 0, booksCount: 3, editionId }]),
      ),
    ).rejects.toThrow("NOT_ENOUGH_BOOKS");

    expect(prismaMock.bookInventory.update).not.toHaveBeenCalled();
  });

  it("creates a new book edition when newEditionName is given", async () => {
    prismaMock.bookEdition.upsert.mockResolvedValue({
      id: "edition-new",
      name: "Chapter 5",
      createdAt: new Date(),
    });
    prismaMock.bookInventory.findUnique.mockResolvedValue({
      id: "bi-1",
      orgId,
      grade: 10,
      editionId: "edition-new",
      count: 20,
    });

    await createSale(
      makeFormData([{ orgId, grade: 10, codesCount: 0, booksCount: 2, newEditionName: "Chapter 5" }]),
    );

    expect(prismaMock.bookEdition.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { name: "Chapter 5" } }),
    );
    expect(prismaMock.bookInventory.update).toHaveBeenCalledWith({
      where: { orgId_grade_editionId: { orgId, grade: 10, editionId: "edition-new" } },
      data: { count: { decrement: 2 } },
    });
  });

  it("rejects an item with neither books nor codes", async () => {
    await expect(
      createSale(makeFormData([{ orgId, grade: 10, codesCount: 0, booksCount: 0 }])),
    ).rejects.toThrow();
  });

  it("rejects books without an edition selection", async () => {
    await expect(
      createSale(makeFormData([{ orgId, grade: 10, codesCount: 0, booksCount: 2 }])),
    ).rejects.toThrow();
  });
});
