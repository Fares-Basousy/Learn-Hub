-- AlterTable
ALTER TABLE "organizations" ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0;

-- Backfill: give existing organizations a stable, unique order matching
-- their current alphabetical listing, so nothing visibly reshuffles.
UPDATE "organizations" o
SET "displayOrder" = sub.rn - 1
FROM (SELECT "id", ROW_NUMBER() OVER (ORDER BY "name" ASC) AS rn FROM "organizations") sub
WHERE o."id" = sub."id";
