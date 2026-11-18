
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = [
    { name: "Alex Morgan", email: "alex@ajaia.demo" },
    { name: "Jordan Lee", email: "jordan@ajaia.demo" },
    { name: "Taylor Smith", email: "taylor@ajaia.demo" },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name },
      create: user,
    });
  }

  console.log("Successfully seeded 3 demo users.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
