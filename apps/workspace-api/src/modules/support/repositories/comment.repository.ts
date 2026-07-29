import { prisma, TicketComment, Prisma } from '@workspace/database';

export class CommentRepository {
  static async create(orgId: string, data: Prisma.TicketCommentUncheckedCreateInput): Promise<TicketComment | null> {
    // Tenant filter: Ensure the ticket belongs to the org
    const ticket = await prisma.ticket.findFirst({ where: { id: data.ticketId, orgId } });
    if (!ticket) return null;

    return prisma.ticketComment.create({ data });
  }

  static async findByTicketId(ticketId: string, orgId: string) {
    const ticket = await prisma.ticket.findFirst({ where: { id: ticketId, orgId } });
    if (!ticket) return null;

    return prisma.ticketComment.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async delete(id: string, orgId: string): Promise<boolean> {
    const comment = await prisma.ticketComment.findFirst({ 
      where: { 
        id, 
        ticket: { orgId } 
      } 
    });
    
    if (!comment) return false;

    await prisma.ticketComment.delete({ where: { id } });
    return true;
  }
}
