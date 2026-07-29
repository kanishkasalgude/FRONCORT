import { prisma, Ticket, Prisma } from '@workspace/database';

export class TicketRepository {
  static async create(orgId: string, data: Prisma.TicketUncheckedCreateWithoutOrgInput): Promise<Ticket> {
    return prisma.ticket.create({
      data: {
        ...data,
        orgId,
      },
    });
  }

  static async findById(id: string, orgId: string) {
    return prisma.ticket.findFirst({
      where: { id, orgId },
      include: {
        creator: { select: { id: true, email: true } },
        assignee: { select: { id: true, email: true } }
      }
    });
  }

  static async findMany(orgId: string): Promise<Ticket[]> {
    return prisma.ticket.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async update(id: string, orgId: string, data: Prisma.TicketUncheckedUpdateInput): Promise<Ticket | null> {
    const exists = await prisma.ticket.findFirst({ where: { id, orgId } });
    if (!exists) return null;

    return prisma.ticket.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string, orgId: string): Promise<boolean> {
    const exists = await prisma.ticket.findFirst({ where: { id, orgId } });
    if (!exists) return false;

    await prisma.ticket.delete({ where: { id } });
    return true;
  }
}
