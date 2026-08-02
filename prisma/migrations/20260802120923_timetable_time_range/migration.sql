ALTER TABLE "timetable_entries" DROP COLUMN "sessionIndex";
ALTER TABLE "timetable_entries" DROP COLUMN "startTime";
ALTER TABLE "timetable_entries" DROP COLUMN "endTime";
ALTER TABLE "timetable_entries" ADD COLUMN "startMinute" INTEGER NOT NULL;
ALTER TABLE "timetable_entries" ADD COLUMN "endMinute" INTEGER NOT NULL;

CREATE INDEX "timetable_entries_classroom_dayOfWeek_idx" ON "timetable_entries"("classroom", "dayOfWeek");
