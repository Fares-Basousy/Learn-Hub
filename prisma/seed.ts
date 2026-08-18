import "dotenv/config";
import { hash } from "bcryptjs";
import prisma from "../src/lib/prisma";
import { Gender } from "../src/generated/prisma/enums";
import { Courses } from "../src/lib/types";
import { CLASSROOMS, MAX_END_MINUTE, MIN_START_MINUTE, TIME_STEP_MINUTES } from "../src/lib/timetable";

const SALT_ROUNDS = 12;

const GRADES = [9, 10, 11, 12];
const SCHOOLS = ["Al-Noor Secondary", "Bright Future School", "Unity High", "Horizon Academy"];
const FIRST_NAMES_M = ["Omar", "Youssef", "Karim", "Ahmed", "Mostafa", "Ziad", "Hassan", "Tarek"];
const FIRST_NAMES_F = ["Mariam", "Nour", "Salma", "Yara", "Farida", "Layla", "Hana", "Dina"];
const LAST_NAMES = ["Hassan", "Ibrahim", "El-Sayed", "Fathy", "Mahmoud", "Kamal", "Adel", "Naguib"];
const TEACHER_NAMES = ["Mr. Ahmed", "Ms. Layla", "Mr. Omar", "Ms. Fatima", "Mr. Tarek", "Ms. Salma"];
const DURATIONS_MINUTES = [90, 120, 150];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Clearing existing data…");
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.action.deleteMany();
  await prisma.student.deleteMany();
  await prisma.bookInventory.deleteMany();
  await prisma.bookEdition.deleteMany();
  await prisma.organizationInventory.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.news.deleteMany();
  await prisma.timetableEntry.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding users…");
  const hashedPassword = await hash("password123", SALT_ROUNDS);
  const users = await Promise.all(
    [
      { name: "Admin User", email: "admin@school.local", number: "01000000001" },
      { name: "Sales Staff", email: "sales@school.local", number: "01000000002" },
      { name: "Front Desk", email: "desk@school.local", number: "01000000003" },
    ].map((u) => prisma.user.create({ data: { ...u, password: hashedPassword } })),
  );

  console.log("Seeding organizations + inventory…");
  const orgNames = [
    { name: "Al-Nour Institute", subject: "Mathematics" },
    { name: "Al-Fajr Academy", subject: "Science" },
    { name: "Bright Future School", subject: "English" },
    { name: "Al-Salam Center", subject: "Arabic" },
    { name: "Horizon Learning", subject: "Physics" },
    { name: "Al-Andalus School", subject: "Chemistry" },
    { name: "Unity Academy", subject: "Biology" },
    { name: "Al-Rawda Institute", subject: "Mathematics" },
  ];

  console.log("Seeding book editions…");
  const editions = await Promise.all(
    ["Chapter 1", "Chapter 2", "Chapter 3", "Revision 1", "Revision 2"].map((name) =>
      prisma.bookEdition.create({ data: { name } }),
    ),
  );

  const organizations = [];
  for (let i = 0; i < orgNames.length; i++) {
    const { name, subject } = orgNames[i];
    const org = await prisma.organization.create({
      data: {
        name,
        subject,
        picUrl: `https://picsum.photos/seed/org-${i}/200/200`,
      },
    });
    organizations.push(org);

    // Each org carries inventory for 2-4 of the grades, never mixing counts between grades.
    const gradesForOrg = GRADES.filter(() => Math.random() > 0.25);
    for (const grade of gradesForOrg.length ? gradesForOrg : [pick(GRADES)]) {
      await prisma.organizationInventory.create({
        data: {
          orgId: org.id,
          grade,
          codesCount: 10 + Math.floor(Math.random() * 50),
        },
      });
      // Stock 1-3 editions of books for this org/grade.
      const editionsForGrade = [...editions].sort(() => Math.random() - 0.5).slice(0, 1 + Math.floor(Math.random() * 3));
      for (const edition of editionsForGrade) {
        await prisma.bookInventory.create({
          data: {
            orgId: org.id,
            grade,
            editionId: edition.id,
            count: 10 + Math.floor(Math.random() * 50),
          },
        });
      }
    }
  }

  console.log("Seeding students…");
  const STUDENT_COUNT = 55;
  const students = [];
  for (let i = 0; i < STUDENT_COUNT; i++) {
    const gender: Gender = Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE;
    const firstName = gender === Gender.MALE ? pick(FIRST_NAMES_M) : pick(FIRST_NAMES_F);
    const org = pick(organizations);
    const student = await prisma.student.create({
      data: {
        name: `${firstName} ${pick(LAST_NAMES)}`,
        number: `STU-${String(1000 + i)}`,
        grade: pick(GRADES),
        school: pick(SCHOOLS),
        type: Math.random() > 0.7 ? "transfer" : null,
        gender,
        organizations: { create: { orgId: org.id } },
      },
    });
    students.push(student);
  }

  console.log("Seeding sales…");
  const inventory = await prisma.organizationInventory.findMany();
  const bookInventory = await prisma.bookInventory.findMany();
  for (let i = 0; i < 8; i++) {
    const itemCount = 1 + Math.floor(Math.random() * 2);
    const chosen = new Set<string>();
    const items = [];
    while (items.length < itemCount && chosen.size < inventory.length) {
      const inv = pick(inventory);
      const key = `${inv.orgId}-${inv.grade}`;
      if (chosen.has(key)) continue;
      chosen.add(key);
      const booksCount = Math.floor(Math.random() * 4);
      const editionForGrade = bookInventory.find((bi) => bi.orgId === inv.orgId && bi.grade === inv.grade);
      items.push({
        orgId: inv.orgId,
        grade: inv.grade,
        booksCount: editionForGrade ? booksCount : 0,
        codesCount: Math.floor(Math.random() * 4),
        editionId: booksCount > 0 && editionForGrade ? editionForGrade.editionId : undefined,
      });
    }
    await prisma.sale.create({
      data: {
        userId: pick(users).id,
        items: { create: items },
      },
    });
  }

  console.log("Seeding news…");
  const newsItems = [
    {
      title: "New semester registration is open",
      body: "Students can now register for the upcoming semester through their organization.",
      imageUrl: "https://picsum.photos/seed/news-1/600/300",
    },
    {
      title: "Updated grade 11 curriculum",
      body: "The grade 11 curriculum has been refreshed for the new academic year.",
      imageUrl: "https://picsum.photos/seed/news-2/600/300",
    },
  ];
  for (const n of newsItems) {
    await prisma.news.create({ data: n });
  }

  console.log("Seeding timetable entries…");
  let timetableCount = 0;
  for (const classroom of CLASSROOMS) {
    for (let dayOfWeek = 0; dayOfWeek <= 5; dayOfWeek++) {
      // Skip some days per classroom so the timetable isn't uniformly packed.
      if (Math.random() < 0.15) continue;

      let cursor = MIN_START_MINUTE;
      while (cursor + Math.min(...DURATIONS_MINUTES) <= MAX_END_MINUTE) {
        const duration = pick(DURATIONS_MINUTES);
        const endMinute = cursor + duration;
        if (endMinute > MAX_END_MINUTE) break;

        await prisma.timetableEntry.create({
          data: {
            classroom,
            dayOfWeek,
            startMinute: cursor,
            endMinute,
            grade: pick(GRADES),
            course: pick(Courses as unknown as string[]),
            teacherName: pick(TEACHER_NAMES),
            teacherSchool: pick(SCHOOLS),
          },
        });
        timetableCount++;

        // Leave a gap (or not) before the next session, snapped to the 30-minute grid.
        const gap = Math.random() < 0.5 ? 0 : TIME_STEP_MINUTES;
        cursor = endMinute + gap;
      }
    }
  }

  console.log(
    `Done. Seeded ${users.length} users, ${organizations.length} organizations, ${students.length} students, 8 sales, 2 news items, ${timetableCount} timetable entries.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
