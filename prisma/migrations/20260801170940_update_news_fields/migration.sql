-- Replace the old bilingual-adjacent News columns with the single-language shape the app actually uses.
ALTER TABLE "news" RENAME COLUMN "description" TO "body";
ALTER TABLE "news" RENAME COLUMN "picUrl" TO "imageUrl";
ALTER TABLE "news" RENAME COLUMN "createdAt" TO "publishedAt";
ALTER TABLE "news" ALTER COLUMN "body" DROP NOT NULL;
ALTER TABLE "news" ALTER COLUMN "imageUrl" DROP NOT NULL;
ALTER TABLE "news" ADD COLUMN "linkLabel" TEXT;
