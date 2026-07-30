import { SessionRepository } from '../repositories/session.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { JwtService } from './jwt.service';
import { AuditService } from '../../audit/services/audit.service';

export class SessionService {
  static async validateSession(sessionId: string): Promise<boolean> {
    const session = await SessionRepository.findById(sessionId);
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return false;
    }
    return true;
  }
  
  static async updateLastUsed(sessionId: string, ipAddress?: string, userAgent?: string) {
    await SessionRepository.updateLastUsed(sessionId, { ipAddress, userAgent });
  }

  static async revokeSession(sessionId: string, userId?: string, orgId?: string) {
    await SessionRepository.revoke(sessionId);
    if (userId && orgId) {
      await AuditService.logAction({
        userId,
        organizationId: orgId,
        action: 'LOGOUT',
        resourceType: 'SESSION',
        resourceId: sessionId,
      });
    }
  }

  static async revokeAllUserSessions(userId: string) {
    await SessionRepository.revokeAllForUser(userId);
  }

  static async refresh(oldRefreshToken: string, ipAddress?: string, userAgent?: string) {
    const hash = JwtService.hashRefreshToken(oldRefreshToken);
    const session = await SessionRepository.findByRefreshTokenHash(hash);

    if (!session) {
      throw new Error('Invalid refresh token');
    }

    if (session.revokedAt || session.expiresAt < new Date()) {
      throw new Error('Refresh token expired or revoked');
    }

    // Revoke old session (rotation)
    await SessionRepository.revoke(session.id);

    // Verify membership to get role for new token
    const membership = await MembershipRepository.findFirstByUserId(session.userId);
    if (!membership) {
      throw new Error('User has no active organizations');
    }

    const newRefreshToken = JwtService.generateRefreshToken();
    const newRefreshTokenHash = JwtService.hashRefreshToken(newRefreshToken);
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newSession = await SessionRepository.create({
      userId: session.userId,
      refreshTokenHash: newRefreshTokenHash,
      expiresAt: sessionExpiresAt,
      ipAddress,
      userAgent,
    });

    const newAccessToken = JwtService.generateAccessToken({
      userId: session.userId,
      sessionId: newSession.id,
      activeOrgId: membership.orgId,
      role: membership.role,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
