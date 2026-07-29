import { prisma, Role, Session } from '@workspace/database';
import { RegisterInput } from '@workspace/shared/validation/auth';

export class AuthTransactionRepository {
  /**
   * Executes the atomic registration flow.
   */
  static async registerWithDefaults(
    data: RegisterInput, 
    passwordHash: string,
    refreshTokenHash: string,
    sessionExpiresAt: Date,
    ipAddress?: string,
    userAgent?: string
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
        },
      });

      // 2. Create Default Org
      const org = await tx.org.create({
        data: {
          name: data.orgName,
        },
      });

      // 3. Create Membership
      await tx.orgMembership.create({
        data: {
          userId: user.id,
          orgId: org.id,
          role: Role.ORG_ADMIN,
        },
      });

      // 4. Create Initial Session
      const session = await tx.session.create({
        data: {
          userId: user.id,
          refreshTokenHash,
          expiresAt: sessionExpiresAt,
          ipAddress,
          userAgent,
        },
      });

      return { user, org, session };
    });
  }
}
