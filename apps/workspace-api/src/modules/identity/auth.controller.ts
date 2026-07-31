import { Request, Response, NextFunction } from 'express';
import { AuthService } from './services/auth.service';
import { SessionService } from './services/session.service';
import { OrgService } from './services/org.service';
import { sendSuccess, sendError } from '../../utils/response';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken, user, org } = await AuthService.register(
        req.body,
        req.ip,
        req.get('user-agent')
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(res, { accessToken, user, org }, 201);
    } catch (error: any) {
      if (error.message === 'User already exists') {
        return sendError(res, 'CONFLICT', error.message, 409);
      }
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken, user } = await AuthService.login(
        req.body,
        req.ip,
        req.get('user-agent')
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(res, { accessToken, user });
    } catch (error: any) {
      if (error.message === 'Invalid credentials' || error.message === 'User has no active organizations') {
        return sendError(res, 'UNAUTHORIZED', error.message, 401);
      }
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.sessionId) {
        await SessionService.revokeSession(req.user.sessionId, req.user.userId, req.user.activeOrgId);
      }
      res.clearCookie('refreshToken');
      return sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.userId) {
        await SessionService.revokeAllUserSessions(req.user.userId);
      }
      res.clearCookie('refreshToken');
      return sendSuccess(res, { message: 'All sessions revoked' });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const oldRefreshToken = req.cookies.refreshToken;
      if (!oldRefreshToken) {
        return sendError(res, 'UNAUTHORIZED', 'No refresh token provided', 401);
      }

      const { accessToken, refreshToken } = await SessionService.refresh(
        oldRefreshToken,
        req.ip,
        req.get('user-agent')
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(res, { accessToken });
    } catch (error: any) {
      res.clearCookie('refreshToken');
      return sendError(res, 'UNAUTHORIZED', error.message || 'Invalid refresh token', 401);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const orgs = await OrgService.getUserOrgs(req.user!.userId);
      const { prisma } = require('@workspace/database');
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
      return sendSuccess(res, {
        id: user!.id,
        email: user!.email,
        name: user!.email.split('@')[0],
        globalRole: user!.isPlatformAdmin ? 'admin' : 'user',
        organizationId: req.user!.activeOrgId,
        organizations: orgs,
      });
    } catch (error) {
      next(error);
    }
  }

  static async switchOrg(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken } = await OrgService.switchOrg(
        req.user!.userId,
        req.body.orgId,
        req.user!.sessionId,
        req.ip,
        req.get('user-agent')
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(res, { accessToken });
    } catch (error: any) {
      return sendError(res, 'FORBIDDEN', error.message || 'Cannot switch to this organization', 403);
    }
  }
}
