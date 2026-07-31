import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.auditLog.deleteMany();
    console.log("SUCCESS: Deleted audit logs (Wait, this shouldn't happen!)");
  } catch (error) {
    console.log("EXPECTED ERROR:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
