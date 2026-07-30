import { prisma, PRReviewer, Prisma } from '@workspace/database';

export class ReviewerRepository {
  static async addReviewer(prId: string, userId: string): Promise<PRReviewer> {
    return prisma.pRReviewer.create({
      data: {
        prId,
        userId,
      },
    });
  }

  static async removeReviewer(prId: string, userId: string): Promise<boolean> {
    const exists = await prisma.pRReviewer.findFirst({ where: { prId, userId } });
    if (!exists) return false;

    await prisma.pRReviewer.delete({ where: { id: exists.id } });
    return true;
  }

  static async findByPrId(prId: string): Promise<PRReviewer[]> {
    return prisma.pRReviewer.findMany({
      where: { prId },
      include: {
        user: { select: { id: true, email: true } }
      }
    });
  }

  static async findByPrIdAndUserId(prId: string, userId: string): Promise<PRReviewer | null> {
    return prisma.pRReviewer.findFirst({
      where: { prId, userId }
    });
  }

  static async updateStatus(id: string, approvalStatus: any): Promise<PRReviewer> {
    return prisma.pRReviewer.update({
      where: { id },
      data: { approvalStatus },
    });
  }
}
