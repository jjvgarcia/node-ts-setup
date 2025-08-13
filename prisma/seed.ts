import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users
  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
    },
  });

  console.log('✅ Users created:', { user1: user1.email, user2: user2.email });

  // Create notes
  const note1 = await prisma.note.create({
    data: {
      title: 'Welcome Note',
      content: 'This is your first note! You can create, edit, and delete notes.',
      userId: user1.id,
    },
  });

  const note2 = await prisma.note.create({
    data: {
      title: 'API Documentation',
      content: 'Check out the API documentation at /api-docs for more information about available endpoints.',
      userId: user1.id,
    },
  });

  const note3 = await prisma.note.create({
    data: {
      title: 'Admin Note',
      content: 'This is an admin note with important system information.',
      userId: user2.id,
    },
  });

  console.log('✅ Notes created:', { 
    note1: note1.title, 
    note2: note2.title, 
    note3: note3.title 
  });

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
