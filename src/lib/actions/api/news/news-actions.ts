"use server"
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { NewsItem } from "@/src/lib/types";

// Update always sends every field, using "" to mean "clear this" for nullable fields.
const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

const PatchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  body: z.preprocess(emptyToNull, z.string().trim().max(2000).nullable().optional()),
  imageUrl: z.preprocess(emptyToNull, z.string().trim().url().max(2000).nullable().optional()),
  linkUrl: z.preprocess(emptyToNull, z.string().trim().url().max(2000).nullable().optional()),
  linkLabel: z.preprocess(emptyToNull, z.string().trim().max(120).nullable().optional()),
  publishedAt: z.string().datetime().optional(),
});
const NewsSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().max(2000).optional().nullable(),
  imageUrl: z.string().trim().url().max(2000).optional().nullable(),
  linkUrl: z.string().trim().url().max(2000).optional().nullable(),
  linkLabel: z.string().trim().max(120).optional().nullable(),
  publishedAt: z.string().datetime().optional(),
});

export async function createPost(formData: FormData) {
  await requireUser();
  const entries = Object.fromEntries(formData.entries());
  const data = NewsSchema.parse(entries);
  const item = await prisma.news.create({
    data: {
      title: data.title,
      body: data.body ?? null,
      imageUrl: data.imageUrl ?? null,
      linkUrl: data.linkUrl ?? null,
      linkLabel: data.linkLabel ?? null,
      ...(data.publishedAt ? { publishedAt: new Date(data.publishedAt) } : {}),
    },
  });
  return { item };
}

export async function getPosts() {
  try {
    const items: NewsItem[] = (
      await prisma.news.findMany({ orderBy: { publishedAt: "desc" } })
    ).map((n) => ({ ...n, publishedAt: n.publishedAt.toISOString() }));
    return { items };
  } catch (e) {
    return { items: [] as NewsItem[], warning: (e as Error).message };
  }
}

export async function updatePost(formData: FormData, id: string) {
  await requireUser();
  const entries = Object.fromEntries(formData.entries());
  const data = PatchSchema.parse(entries);
  const item = await prisma.news.update({
    where: { id },
    data: {
      title: data.title,
      body: data.body,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl,
      linkLabel: data.linkLabel,
      ...(data.publishedAt ? { publishedAt: new Date(data.publishedAt) } : {}),
    },
  });
  return { item };
}

export async function deletePost(id: string) {
  await requireUser();
  await prisma.news.delete({ where: { id } });
  return { ok: true };
}
