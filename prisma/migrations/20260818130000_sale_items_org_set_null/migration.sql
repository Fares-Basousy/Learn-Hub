-- Preserve sale history when an organization is deleted: sale items no longer
-- block org deletion, they just lose their org reference (like editionId already does).
ALTER TABLE "sale_items" DROP CONSTRAINT "sale_items_orgId_fkey";

ALTER TABLE "sale_items" ALTER COLUMN "orgId" DROP NOT NULL;

ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
