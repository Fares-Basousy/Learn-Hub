// Programmatic user registration — there is no public sign-up flow.
// Usage: pnpm create-user "Full Name" email@example.com "phone-number" "password"
import "dotenv/config";
import { hash } from "bcryptjs";
import prisma from "../src/lib/prisma";

const SALT_ROUNDS = 12;

async function main() {
  const [name, email, number, password] = process.argv.slice(2);

  if (!name || !email || !number || !password) {
    console.error(
      'Usage: pnpm create-user "Full Name" email@example.com "phone-number" "password"',
    );
    process.exit(1);
  }

  const hashedPassword = await hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, number, password: hashedPassword },
    select: { id: true, name: true, email: true },
  });

  console.log("Created user:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
