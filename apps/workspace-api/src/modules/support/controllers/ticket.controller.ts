import { Request, Response, NextFunction } from 'express';
import { TicketService } from '../services/ticket.service';
import { sendSuccess, sendError } from '../../../utils/response';

export class TicketController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await TicketService.createTicket(
        req.user!.activeOrgId,
        req.user!.userId,
        req.body
      );
      return sendSuccess(res, ticket, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMany(req: Request, res: Response, next: NextFunction) {
    try {
      const tickets = await TicketService.getTickets(req.user!.activeOrgId);
      return sendSuccess(res, tickets);
    } catch (error) {
      next(error);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await TicketService.getTicketById(req.params.id, req.user!.activeOrgId);
      return sendSuccess(res, ticket);
    } catch (error: any) {
      if (error.message === 'Ticket not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await TicketService.updateTicket(req.params.id, req.user!.activeOrgId, req.body);
      return sendSuccess(res, ticket);
    } catch (error: any) {
      if (error.message === 'Ticket not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await TicketService.updateStatus(req.params.id, req.user!.activeOrgId, req.body);
      return sendSuccess(res, ticket);
    } catch (error: any) {
      if (error.message === 'Ticket not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      next(error);
    }
  }

  static async assign(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await TicketService.assignTicket(req.params.id, req.user!.activeOrgId, req.body);
      return sendSuccess(res, ticket);
    } catch (error: any) {
      if (error.message === 'Ticket not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await TicketService.deleteTicket(req.params.id, req.user!.activeOrgId);
      return sendSuccess(res, { deleted: true });
    } catch (error: any) {
      if (error.message === 'Ticket not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      next(error);
    }
  }
}
