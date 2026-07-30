"use server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Sale } from "@/src/lib/types";
import { requiresession } from "@/lib/session.server";

const PAGE_SIZE = 10;

const SaleItemSchema = z.object({
  orgId: z.string().uuid(),
  grade: z.coerce.number().int().min(1).max(12),
  booksCount: z.coerce.number().int().nonnegative().default(0),
  codesCount: z.coerce.number().int().nonnegative().default(0),
});

const CreateSchema = z.object({
  items: z.string().min(1),
});

export async function createSale(formData: FormData) {
  const session = await requiresession();
  const entries = Object.fromEntries(formData.entries());
  const { items } = CreateSchema.parse(entries);
  const parsedItems = SaleItemSchema.array().min(1).parse(JSON.parse(items));
  const userId = session.userId;

  const sale = await prisma.$transaction(async (tx) => {
    const created = await tx.sale.create({
      data: {
        userId,
        items: {
          create: parsedItems.map((i) => ({
            orgId: i.orgId,
            grade: i.grade,
            booksCount: i.booksCount,
            codesCount: i.codesCount,
          })),
        },
      },
      include: { items: { include: { org: true } } },
    });

    for (const item of parsedItems) {
      await tx.organizationInventory.update({
        where: { orgId_grade: { orgId: item.orgId, grade: item.grade } },
        data: {
          booksCount: { decrement: item.booksCount },
          codesCount: { decrement: item.codesCount },
        },
      });
    }

    return created;
  });

  return { sale };
}

export async function getSaleById(id: string) {
  //requiresession();
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { items: { include: { org: true } } },
  });
  return { sale };
}

export async function getSales(pageIndex: number) {
  //requiresession();
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { soldAt: "desc" },
      skip: pageIndex * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { items: { include: { org: true } } },
    });
    return { sales };
  } catch (e) {
    return { sales: [] as Sale[], warning: (e as Error).message };
  }
}
