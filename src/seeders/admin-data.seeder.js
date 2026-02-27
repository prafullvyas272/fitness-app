import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Find the SuperAdmin role
  let superAdminRole = await prisma.role.findUnique({
    where: { name: 'SuperAdmin' },
  });

  if (!superAdminRole) {
    superAdminRole = await prisma.role.create({
      data: { name: 'SuperAdmin' }
    });
  }

  const adminEmail = 'admin@upt.com';

  const hashedPassword = await bcrypt.hash('Upt@123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      roleId: superAdminRole.id,
      provider: 'LOCAL'
    }
  });

  console.log("Admin user seeded:", adminUser.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
