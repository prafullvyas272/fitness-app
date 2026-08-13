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

  // Create or update MentorProfile
  const mentorProfile = await prisma.mentorProfile.upsert({
    where: { userId: mentorUser.id },
    update: {
      status: 'ACTIVE'
    },
    create: {
      userId: mentorUser.id,
      title: 'Senior Trainer Success Manager',
      experience: 5,
      region: 'North America',
      maxPTs: 30,
      status: 'ACTIVE'
    }
  });

  console.log("Mentor user seeded:", mentorUser.email);
  console.log("Mentor profile created");
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
