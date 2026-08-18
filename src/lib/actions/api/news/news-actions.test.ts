import { prismaMock } from "@/test/prisma-mock";
import { createPost, updatePost } from "@/lib/actions/api/news/news-actions";

function makeFormData(fields: Record<string, string>) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

const baseItem = {
  id: "news-1",
  title: "Existing title",
  body: "Existing body",
  imageUrl: "https://example.com/old.png",
  linkUrl: "https://example.com/old-link",
  linkLabel: "Old label",
  publishedAt: new Date(),
};

describe("updatePost", () => {
  // Regression test: the edit form used to omit cleared fields from the
  // FormData entirely, which Prisma's update() treats as "leave unchanged"
  // rather than "clear it" — so removing a link URL silently kept the old one.
  it("clears linkUrl to null when the field is submitted empty", async () => {
    prismaMock.news.update.mockResolvedValue({ ...baseItem, linkUrl: null });

    await updatePost(
      makeFormData({
        title: "Existing title",
        body: "Existing body",
        imageUrl: "https://example.com/old.png",
        linkUrl: "",
        linkLabel: "",
      }),
      "news-1",
    );

    expect(prismaMock.news.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "news-1" },
        data: expect.objectContaining({ linkUrl: null, linkLabel: null }),
      }),
    );
  });

  it("keeps a non-empty linkUrl as-is", async () => {
    prismaMock.news.update.mockResolvedValue(baseItem);

    await updatePost(
      makeFormData({
        title: "Existing title",
        linkUrl: "https://example.com/new-link",
      }),
      "news-1",
    );

    expect(prismaMock.news.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ linkUrl: "https://example.com/new-link" }),
      }),
    );
  });

  it("rejects an invalid (non-empty, non-URL) linkUrl", async () => {
    await expect(
      updatePost(makeFormData({ title: "x", linkUrl: "not-a-url" }), "news-1"),
    ).rejects.toThrow();
  });
});

describe("createPost", () => {
  it("stores null for omitted optional fields", async () => {
    prismaMock.news.create.mockResolvedValue(baseItem);

    await createPost(makeFormData({ title: "New post" }));

    expect(prismaMock.news.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "New post",
          body: null,
          imageUrl: null,
          linkUrl: null,
          linkLabel: null,
        }),
      }),
    );
  });
});
