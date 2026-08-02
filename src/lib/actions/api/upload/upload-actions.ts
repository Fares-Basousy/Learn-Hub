"use server"
import { put } from "@vercel/blob";
import { requireUser } from "@/lib/require-user";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function uploadImage(formData: FormData) {
  await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file provided");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("Image must be smaller than 5MB");
  }
  const folderRaw = formData.get("folder");
  const folder = typeof folderRaw === "string" && /^[a-z-]+$/.test(folderRaw) ? folderRaw : "uploads";
  const blob = await put(`${folder}/${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return { url: blob.url };
}
