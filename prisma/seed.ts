import "dotenv/config";
import { hash } from "bcryptjs";
import prisma from "../src/lib/prisma";
import { Gender } from "../src/generated/prisma/enums";

const SALT_ROUNDS = 12;

const GRADES = [9, 10, 11, 12];
const SCHOOLS = ["Al-Noor Secondary", "Bright Future School", "Unity High", "Horizon Academy"];
const FIRST_NAMES_M = ["Omar", "Youssef", "Karim", "Ahmed", "Mostafa", "Ziad", "Hassan", "Tarek"];
const FIRST_NAMES_F = ["Mariam", "Nour", "Salma", "Yara", "Farida", "Layla", "Hana", "Dina"];
const LAST_NAMES = ["Hassan", "Ibrahim", "El-Sayed", "Fathy", "Mahmoud", "Kamal", "Adel", "Naguib"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Clearing existing data…");
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.action.deleteMany();
  await prisma.student.deleteMany();
  await prisma.organizationInventory.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.news.deleteMany();
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
          booksCount: 10 + Math.floor(Math.random() * 50),
          codesCount: 10 + Math.floor(Math.random() * 50),
        },
      });
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
        orgId: org.id,
      },
    });
    students.push(student);
  }

  console.log("Seeding sales…");
  const inventory = await prisma.organizationInventory.findMany();
  for (let i = 0; i < 8; i++) {
    const itemCount = 1 + Math.floor(Math.random() * 2);
    const chosen = new Set<string>();
    const items = [];
    while (items.length < itemCount && chosen.size < inventory.length) {
      const inv = pick(inventory);
      const key = `${inv.orgId}-${inv.grade}`;
      if (chosen.has(key)) continue;
      chosen.add(key);
      items.push({
        orgId: inv.orgId,
        grade: inv.grade,
        booksCount: Math.floor(Math.random() * 4),
        codesCount: Math.floor(Math.random() * 4),
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

  console.log(
    `Done. Seeded ${users.length} users, ${organizations.length} organizations, ${students.length} students, 8 sales, 2 news items.`,
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
