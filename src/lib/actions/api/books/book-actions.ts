"use server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

export async function getBookEditions() {
  await requireUser();
  const editions = await prisma.bookEdition.findMany({ orderBy: { name: "asc" } });
  return { editions };
}
