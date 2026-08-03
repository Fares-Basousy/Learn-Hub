-- CreateTable
CREATE TABLE "book_editions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_editions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_inventory" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "editionId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "book_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "book_editions_name_key" ON "book_editions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "book_inventory_orgId_grade_editionId_key" ON "book_inventory"("orgId", "grade", "editionId");

-- AddForeignKey
ALTER TABLE "book_inventory" ADD CONSTRAINT "book_inventory_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_inventory" ADD CONSTRAINT "book_inventory_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "book_editions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "sale_items" ADD COLUMN     "editionId" TEXT;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "book_editions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DataMigration: preserve existing booksCount values under a default "Unclassified" edition
-- before dropping the column, instead of silently discarding pre-existing stock counts.
INSERT INTO "book_editions" ("id", "name")
VALUES (gen_random_uuid(), 'Unclassified')
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "book_inventory" ("id", "orgId", "grade", "editionId", "count")
SELECT gen_random_uuid(), oi."orgId", oi."grade", be."id", oi."booksCount"
FROM "organization_inventory" oi
CROSS JOIN (SELECT "id" FROM "book_editions" WHERE "name" = 'Unclassified') be
WHERE oi."booksCount" > 0;

-- DataMigration: backfill existing sale items that recorded books under the same default edition.
UPDATE "sale_items"
SET "editionId" = (SELECT "id" FROM "book_editions" WHERE "name" = 'Unclassified')
WHERE "booksCount" > 0;

-- AlterTable
ALTER TABLE "organization_inventory" DROP COLUMN "booksCount";
