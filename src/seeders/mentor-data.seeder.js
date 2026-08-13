import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Find or create Mentor role
  let mentorRole = await prisma.role.findUnique({
    where: { name: 'Mentor' },
  });

  if (!mentorRole) {
    mentorRole = await prisma.role.create({
      data: { name: 'Mentor' }
    });
  }

  const mentorEmail = 'mentor@fitness.com';
  const hashedPassword = await bcrypt.hash('Mentor123', 10);

  const mentorUser = await prisma.user.upsert({
    where: { email: mentorEmail },
    update: {
      isActive: true,
      phoneVerified: true,
      provider: 'LOCAL'
    },
    create: {
      email: mentorEmail,
      firstName: 'John',
      lastName: 'Doe',
      password: hashedPassword,
      phone: '+1234567890',
      roleId: mentorRole.id,
      provider: 'LOCAL',
      isActive: true,
      phoneVerified: true
    }
  });

  console.log("Mentor user seeded:", mentorUser.email);
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
