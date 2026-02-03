// Usage: node src/seeders/role.seeder.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: 'SuperAdmin' },
    { name: 'Trainer' },
    { name: 'User' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    console.log(`Role '${role.name}' seeded.`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Roles seeded successfully.");
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
