import { prisma, PullRequest, Prisma } from '@workspace/database';

export class PullRequestRepository {
  static async create(orgId: string, authorId: string, requiredApprovals: number): Promise<PullRequest> {
    return prisma.pullRequest.create({
      data: {
        orgId,
        authorId,
        requiredApprovals,
      },
    });
  }

  static async findById(id: string, orgId: string) {
    return prisma.pullRequest.findFirst({
      where: { id, orgId },
      include: {
        author: { select: { id: true, email: true } },
        reviewers: {
          include: {
            user: { select: { id: true, email: true } }
          }
        }
      }
    });
  }

  static async findMany(orgId: string): Promise<PullRequest[]> {
    return prisma.pullRequest.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, email: true } },
      }
    });
  }

  static async update(id: string, orgId: string, data: Prisma.PullRequestUncheckedUpdateInput): Promise<PullRequest | null> {
    const exists = await prisma.pullRequest.findFirst({ where: { id, orgId } });
    if (!exists) return null;

    return prisma.pullRequest.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string, orgId: string): Promise<boolean> {
    const exists = await prisma.pullRequest.findFirst({ where: { id, orgId } });
    if (!exists) return false;

    await prisma.pullRequest.delete({ where: { id } });
    return true;
  }
}
