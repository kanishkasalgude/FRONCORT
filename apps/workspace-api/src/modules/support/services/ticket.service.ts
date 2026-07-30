import { TicketRepository } from '../repositories/ticket.repository';
import { CreateTicketInput, UpdateTicketInput, AssignTicketInput, StatusTicketInput } from '@workspace/shared/validation/support';
import { MembershipRepository } from '../../identity/repositories/membership.repository';
import { AuditService } from '../../audit/services/audit.service';

export class TicketService {
  static async createTicket(orgId: string, creatorId: string, data: CreateTicketInput) {
    if (data.assignedToId) {
      const membership = await MembershipRepository.findByUserIdAndOrgId(data.assignedToId, orgId);
      if (!membership) throw new Error('Assignee is not a member of the organization');
    }
    const ticket = await TicketRepository.create(orgId, {
      title: data.title,
      creatorId,
      assignedToId: data.assignedToId,
    });

    await AuditService.logAction({
      userId: creatorId,
      organizationId: orgId,
      action: 'CREATE_TICKET',
      resourceType: 'TICKET',
      resourceId: ticket.id,
      metadata: { title: ticket.title, status: ticket.status }
    });

    return ticket;
  }

  static async getTickets(orgId: string) {
    return TicketRepository.findMany(orgId);
  }

  static async getTicketById(id: string, orgId: string) {
    const ticket = await TicketRepository.findById(id, orgId);
    if (!ticket) throw new Error('Ticket not found');
    return ticket;
  }

  static async updateTicket(id: string, orgId: string, actorId: string, data: UpdateTicketInput) {
    if (data.assignedToId) {
      const membership = await MembershipRepository.findByUserIdAndOrgId(data.assignedToId, orgId);
      if (!membership) throw new Error('Assignee is not a member of the organization');
    }
    
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;

    const ticket = await TicketRepository.update(id, orgId, updateData);
    if (!ticket) throw new Error('Ticket not found');

    await AuditService.logAction({
      userId: actorId,
      organizationId: orgId,
      action: 'UPDATE_TICKET',
      resourceType: 'TICKET',
      resourceId: ticket.id,
      metadata: updateData
    });

    return ticket;
  }

  static async assignTicket(id: string, orgId: string, actorId: string, data: AssignTicketInput) {
    if (data.assignedToId) {
      const membership = await MembershipRepository.findByUserIdAndOrgId(data.assignedToId, orgId);
      if (!membership) throw new Error('Assignee is not a member of the organization');
    }
    const ticket = await TicketRepository.update(id, orgId, { assignedToId: data.assignedToId });
    if (!ticket) throw new Error('Ticket not found');

    await AuditService.logAction({
      userId: actorId,
      organizationId: orgId,
      action: 'UPDATE_TICKET',
      resourceType: 'TICKET',
      resourceId: ticket.id,
      metadata: { assignedToId: data.assignedToId }
    });

    return ticket;
  }

  static async updateStatus(id: string, orgId: string, actorId: string, data: StatusTicketInput) {
    const ticket = await TicketRepository.update(id, orgId, { status: data.status });
    if (!ticket) throw new Error('Ticket not found');

    await AuditService.logAction({
      userId: actorId,
      organizationId: orgId,
      action: 'UPDATE_TICKET',
      resourceType: 'TICKET',
      resourceId: ticket.id,
      metadata: { status: data.status }
    });

    return ticket;
  }

  static async deleteTicket(id: string, orgId: string, actorId: string) {
    const success = await TicketRepository.delete(id, orgId);
    if (!success) throw new Error('Ticket not found');

    await AuditService.logAction({
      userId: actorId,
      organizationId: orgId,
      action: 'DELETE_TICKET',
      resourceType: 'TICKET',
      resourceId: id,
    });

    return true;
  }
}
