import { prisma, Session, Prisma } from '@workspace/database';

export class SessionRepository {
  static async create(data: Prisma.SessionUncheckedCreateInput): Promise<Session> {
    return prisma.session.create({ data });
  }

  static async findById(id: string): Promise<Session | null> {
    return prisma.session.findUnique({ where: { id } });
  }

  static async findByRefreshTokenHash(hash: string): Promise<Session | null> {
    return prisma.session.findFirst({ where: { refreshTokenHash: hash } });
  }

  static async updateLastUsed(id: string, updateData: { ipAddress?: string; userAgent?: string }): Promise<void> {
    await prisma.session.update({
      where: { id },
      data: {
        ipAddress: updateData.ipAddress,
        userAgent: updateData.userAgent,
        updatedAt: new Date(), // Implicitly updated by Prisma, but safe
      },
    });
  }

  static async revoke(id: string): Promise<void> {
    await prisma.session.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  static async revokeAllForUser(userId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
