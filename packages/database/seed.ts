// Database Seed Script
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');
}

main().catch(console.error).finally(() => prisma.$disconnect());
