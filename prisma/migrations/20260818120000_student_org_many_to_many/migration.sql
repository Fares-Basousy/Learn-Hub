-- CreateTable: student <-> organization membership (a student can belong to zero or many orgs)
CREATE TABLE "student_organizations" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_organizations_studentId_orgId_key" ON "student_organizations"("studentId", "orgId");

-- AddForeignKey
ALTER TABLE "student_organizations" ADD CONSTRAINT "student_organizations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_organizations" ADD CONSTRAINT "student_organizations_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: preserve each existing student's current org as a membership row.
INSERT INTO "student_organizations" ("id", "studentId", "orgId", "createdAt")
SELECT gen_random_uuid(), "id", "orgId", CURRENT_TIMESTAMP
FROM "students"
WHERE "orgId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_orgId_fkey";

-- AlterTable: students no longer have a single mandatory org
ALTER TABLE "students" DROP COLUMN "orgId";

-- DropForeignKey (re-added below with cascade)
ALTER TABLE "organization_inventory" DROP CONSTRAINT "organization_inventory_orgId_fkey";

-- AddForeignKey: org-owned inventory is deleted along with the organization
ALTER TABLE "organization_inventory" ADD CONSTRAINT "organization_inventory_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey (re-added below with cascade)
ALTER TABLE "book_inventory" DROP CONSTRAINT "book_inventory_orgId_fkey";

-- AddForeignKey: org-owned inventory is deleted along with the organization
ALTER TABLE "book_inventory" ADD CONSTRAINT "book_inventory_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
