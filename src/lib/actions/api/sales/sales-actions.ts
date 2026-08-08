"use server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Sale } from "@/src/lib/types";
import { requireUser } from "@/lib/require-user";

const PAGE_SIZE = 10;

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

const SaleItemSchema = z
  .object({
    orgId: z.string().uuid(),
    grade: z.coerce.number().int().min(1).max(12),
    booksCount: z.coerce.number().int().nonnegative().default(0),
    codesCount: z.coerce.number().int().nonnegative().default(0),
    editionId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
    newEditionName: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(100).optional()),
  })
  .refine((i) => i.booksCount > 0 || i.codesCount > 0, {
    message: "Each item needs at least one book or code.",
  })
  .refine((i) => i.booksCount === 0 || Boolean(i.editionId || i.newEditionName), {
    message: "Select or enter a book edition.",
  });

const CreateSchema = z.object({
  items: z.string().min(1),
});

export async function createSale(formData: FormData) {
  const user = await requireUser();
  const entries = Object.fromEntries(formData.entries());
  const { items } = CreateSchema.parse(entries);
  const parsedItems = SaleItemSchema.array().min(1).parse(JSON.parse(items));
  const userId = user.id;

  const sale = await prisma.$transaction(async (tx) => {
    const itemsWithEdition = await Promise.all(
      parsedItems.map(async (i) => {
        if (i.booksCount === 0) return { ...i, editionId: undefined };
        const editionId =
          i.editionId ??
          (
            await tx.bookEdition.upsert({
              where: { name: i.newEditionName! },
              create: { name: i.newEditionName! },
              update: {},
            })
          ).id;
        return { ...i, editionId };
      }),
    );

    const created = await tx.sale.create({
      data: {
        userId,
        items: {
          create: itemsWithEdition.map((i) => ({
            orgId: i.orgId,
            grade: i.grade,
            booksCount: i.booksCount,
            codesCount: i.codesCount,
            editionId: i.booksCount > 0 ? i.editionId : null,
          })),
        },
      },
      include: { items: { include: { org: true, edition: true } } },
    });

    for (const item of itemsWithEdition) {
      if (item.codesCount > 0) {
        const inv = await tx.organizationInventory.findUnique({
          where: { orgId_grade: { orgId: item.orgId, grade: item.grade } },
        });
        if (!inv || inv.codesCount < item.codesCount) {
          throw new Error("NOT_ENOUGH_CODES");
        }
        await tx.organizationInventory.update({
          where: { orgId_grade: { orgId: item.orgId, grade: item.grade } },
          data: { codesCount: { decrement: item.codesCount } },
        });
      }
      if (item.booksCount > 0 && item.editionId) {
        const bookInv = await tx.bookInventory.findUnique({
          where: { orgId_grade_editionId: { orgId: item.orgId, grade: item.grade, editionId: item.editionId } },
        });
        if (!bookInv || bookInv.count < item.booksCount) {
          throw new Error("NOT_ENOUGH_BOOKS");
        }
        await tx.bookInventory.update({
          where: { orgId_grade_editionId: { orgId: item.orgId, grade: item.grade, editionId: item.editionId } },
          data: { count: { decrement: item.booksCount } },
        });
      }
    }

    return created;
  });

  return { sale };
}

export async function getSaleById(id: string) {
  await requireUser();
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { items: { include: { org: true, edition: true } } },
  });
  return { sale };
}

export async function getSales(pageIndex: number) {
  await requireUser();
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { soldAt: "desc" },
      skip: pageIndex * PAGE_SIZE,
      take: PAGE_SIZE + 1,
      include: { items: { include: { org: true, edition: true } }, user: { select: { id: true, name: true } } },
    });
    const hasMore = sales.length > PAGE_SIZE;
    return { sales: sales.slice(0, PAGE_SIZE), hasMore };
  } catch (e) {
    return { sales: [] as Sale[], hasMore: false, warning: (e as Error).message };
  }
}
