import { RegisterInput, LoginInput } from '@workspace/shared/validation/auth';
import { AuthTransactionRepository } from '../repositories/auth-transaction.repository';
import { UserRepository } from '../repositories/user.repository';
import { SessionRepository } from '../repositories/session.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { JwtService } from './jwt.service';
import bcrypt from 'bcrypt';
import { env } from '../../../utils/env';
import { AuditService } from '../../audit/services/audit.service';

export class AuthService {
  static async register(data: RegisterInput, ipAddress?: string, userAgent?: string) {
    const existingUser = await UserRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const refreshToken = JwtService.generateRefreshToken();
    const refreshTokenHash = JwtService.hashRefreshToken(refreshToken);
    
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const { user, org, session } = await AuthTransactionRepository.registerWithDefaults(
      data,
      passwordHash,
      refreshTokenHash,
      sessionExpiresAt,
      ipAddress,
      userAgent
    );

    const accessToken = JwtService.generateAccessToken({
      userId: user.id,
      sessionId: session.id,
      activeOrgId: org.id,
      role: 'ORG_ADMIN',
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email },
      org: { id: org.id, name: org.name },
    };
  }
  
  static async login(data: LoginInput, ipAddress?: string, userAgent?: string) {
    const user = await UserRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const membership = await MembershipRepository.findFirstByUserId(user.id);
    if (!membership) {
      throw new Error('User has no active organizations');
    }

    const refreshToken = JwtService.generateRefreshToken();
    const refreshTokenHash = JwtService.hashRefreshToken(refreshToken);
    
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session = await SessionRepository.create({
      userId: user.id,
      refreshTokenHash,
      expiresAt: sessionExpiresAt,
      ipAddress,
      userAgent,
    });

    const accessToken = JwtService.generateAccessToken({
      userId: user.id,
      sessionId: session.id,
      activeOrgId: membership.orgId,
      role: membership.role,
    });

    await AuditService.logAction({
      userId: user.id,
      organizationId: membership.orgId,
      action: 'LOGIN',
      resourceType: 'SESSION',
      resourceId: session.id,
      metadata: { ipAddress, userAgent }
    });

    return {
      accessToken,
      refreshToken,
      user: { 
        id: user.id, 
        email: user.email,
        name: user.email.split('@')[0],
        globalRole: user.isPlatformAdmin ? 'admin' : 'user',
        organizationId: membership.orgId
      },
    };
  }
}
