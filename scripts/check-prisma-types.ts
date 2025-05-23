import { PrismaClient } from '@prisma/client';

async function checkTypes() {
  const prisma = new PrismaClient();
  
  // Check if the models exist on the Prisma client
  console.log('Checking Prisma client types...');
  console.log('MilestoneProgress exists:', 'milestoneProgress' in prisma);
  console.log('Notification exists:', 'notification' in prisma);
  
  await prisma.$disconnect();
}

checkTypes().catch(console.error);
