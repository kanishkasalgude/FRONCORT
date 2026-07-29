import { OrgRepository } from '../repositories/org.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { JwtService } from './jwt.service';
import { SessionRepository } from '../repositories/session.repository';

export class OrgService {
  static async switchOrg(userId: string, targetOrgId: string, oldSessionId: string, ipAddress?: string, userAgent?: string) {
    const membership = await MembershipRepository.findByUserIdAndOrgId(userId, targetOrgId);
    if (!membership) {
      throw new Error('User is not a member of the target organization');
    }

    // Revoke the old session to prevent parallel usage of conflicting org states, 
    // or just issue a new one and leave the old one. We will rotate the session.
    await SessionRepository.revoke(oldSessionId);

    const newRefreshToken = JwtService.generateRefreshToken();
    const newRefreshTokenHash = JwtService.hashRefreshToken(newRefreshToken);
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newSession = await SessionRepository.create({
      userId,
      refreshTokenHash: newRefreshTokenHash,
      expiresAt: sessionExpiresAt,
      ipAddress,
      userAgent,
    });

    const newAccessToken = JwtService.generateAccessToken({
      userId,
      sessionId: newSession.id,
      activeOrgId: membership.orgId,
      role: membership.role,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async getUserOrgs(userId: string) {
    return OrgRepository.findUserOrgs(userId);
  }
}
