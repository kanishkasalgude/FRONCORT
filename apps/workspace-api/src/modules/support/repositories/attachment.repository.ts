import { prisma, TicketAttachment, Prisma } from '@workspace/database';

export class AttachmentRepository {
  static async create(orgId: string, data: Prisma.TicketAttachmentUncheckedCreateInput): Promise<TicketAttachment | null> {
    const ticket = await prisma.ticket.findFirst({ where: { id: data.ticketId, orgId } });
    if (!ticket) return null;

    return prisma.ticketAttachment.create({ data });
  }

  static async findByTicketId(ticketId: string, orgId: string) {
    const ticket = await prisma.ticket.findFirst({ where: { id: ticketId, orgId } });
    if (!ticket) return null;

    return prisma.ticketAttachment.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
