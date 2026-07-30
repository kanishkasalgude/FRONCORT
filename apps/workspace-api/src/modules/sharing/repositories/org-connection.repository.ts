import { prisma, ConnectionStatus } from '@workspace/database';

export class OrgConnectionRepository {
  static async checkConnection(orgIdA: string, orgIdB: string): Promise<boolean> {
    const connection = await prisma.orgConnection.findFirst({
      where: {
        OR: [
          { requesterOrgId: orgIdA, partnerOrgId: orgIdB },
          { requesterOrgId: orgIdB, partnerOrgId: orgIdA }
        ],
        status: ConnectionStatus.CONNECTED
      }
    });

    return !!connection;
  }
}
