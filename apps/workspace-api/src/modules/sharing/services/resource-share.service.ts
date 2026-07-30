import { ResourceShareRepository } from '../repositories/resource-share.repository';
import { OrgConnectionRepository } from '../repositories/org-connection.repository';
import { PullRequestRepository } from '../../review/repositories/pull-request.repository';
import { ResourceType, Role } from '@workspace/database';
import { MembershipRepository } from '../../identity/repositories/membership.repository';
import { AuditService } from '../../audit/services/audit.service';

export class ResourceShareService {
  static async shareResource(
    activeOrgId: string,
    userId: string,
    resourceId: string,
    targetOrgId: string,
    resourceType: ResourceType = ResourceType.PULL_REQUEST
  ) {
    // 1. Verify caller is ORG_ADMIN
    const membership = await MembershipRepository.findByUserIdAndOrgId(userId, activeOrgId);
    if (membership?.role !== Role.ORG_ADMIN) {
      const e = new Error('Only ORG_ADMIN can share resources');
      e.name = 'ForbiddenError';
      throw e;
    }

    // 2. Verify source organization owns the resource (prevents share chaining implicitly)
    let resource;
    if (resourceType === ResourceType.PULL_REQUEST) {
      resource = await PullRequestRepository.findById(resourceId, activeOrgId);
    }
    
    if (!resource) {
      const e = new Error('Resource not found or not owned by active organization');
      e.name = 'ConflictError';
      throw e;
    }

    // 3. Verify OrgConnection is CONNECTED
    const isConnected = await OrgConnectionRepository.checkConnection(activeOrgId, targetOrgId);
    if (!isConnected) {
      const e = new Error('Target organization does not have an approved connection');
      e.name = 'ConflictError';
      throw e;
    }

    // 4. Duplicate Share Detection
    const duplicate = await ResourceShareRepository.findActiveShareForTarget(resourceId, targetOrgId);
    if (duplicate) {
      const e = new Error('Resource is already shared with this organization');
      e.name = 'ConflictError';
      throw e;
    }

    // Create the share
    const share = await ResourceShareRepository.createShare(activeOrgId, targetOrgId, resourceId, resourceType, userId);

    await AuditService.logAction({
      userId,
      organizationId: activeOrgId,
      action: 'SHARE_RESOURCE',
      resourceType: 'RESOURCE_SHARE',
      resourceId: share.id,
      metadata: { targetOrgId, sharedResourceId: resourceId, sharedResourceType: resourceType }
    });

    return share;
  }

  static async revokeShare(activeOrgId: string, userId: string, resourceId: string, shareId: string) {
    const membership = await MembershipRepository.findByUserIdAndOrgId(userId, activeOrgId);
    if (membership?.role !== Role.ORG_ADMIN) {
      const e = new Error('Only ORG_ADMIN can revoke shares');
      e.name = 'ForbiddenError';
      throw e;
    }

    // Ensures the activeOrgId owns the share (enforced in repository)
    try {
      await ResourceShareRepository.revokeShare(shareId, activeOrgId);
    } catch (err: any) {
      if (err.code === 'P2025') { // Prisma RecordNotFound
        const e = new Error('Share not found or not owned by active organization');
        e.name = 'NotFoundError';
        throw e;
      }
      throw err;
    }

    await AuditService.logAction({
      userId,
      organizationId: activeOrgId,
      action: 'REVOKE_SHARE',
      resourceType: 'RESOURCE_SHARE',
      resourceId: shareId,
    });
    
    return true;
  }

  static async listShares(activeOrgId: string, resourceId: string) {
    // Optionally check if owner
    const resource = await PullRequestRepository.findById(resourceId, activeOrgId);
    if (!resource) {
      throw new Error('Resource not found');
    }
    return ResourceShareRepository.findSharesByResource(resourceId, activeOrgId);
  }

  static async getSharedWithMe(activeOrgId: string) {
    return ResourceShareRepository.findSharedWithMe(activeOrgId);
  }

  static async getSharedResourceDetails(activeOrgId: string, resourceId: string, resourceType: ResourceType = ResourceType.PULL_REQUEST) {
    // 1. Check normal ownership first
    let resource;
    if (resourceType === ResourceType.PULL_REQUEST) {
      resource = await PullRequestRepository.findById(resourceId, activeOrgId);
    }

    if (resource) {
      return resource; // Return normally if owner
    }

    // 2. Check active ResourceShare
    const share = await ResourceShareRepository.findActiveShare(resourceId, activeOrgId);
    if (!share) {
      const e = new Error('Not Found');
      e.name = 'NotFoundError';
      throw e;
    }

    // Fetch the actual resource bypassing org check, but using the sourceOrgId from the share
    let sharedResource;
    if (resourceType === ResourceType.PULL_REQUEST) {
      sharedResource = await PullRequestRepository.findById(resourceId, share.sourceOrgId);
    }

    if (!sharedResource) {
       const e = new Error('Not Found');
       e.name = 'NotFoundError';
       throw e;
    }

    // 3. Return Read-Only Projection
    return {
      shared: true,
      ownerOrganizationId: share.sourceOrgId,
      receiverOrganizationId: share.targetOrgId,
      permissions: ['READ'],
      resource: {
        id: sharedResource.id,
        status: sharedResource.status,
        requiredApprovals: sharedResource.requiredApprovals,
        authorId: sharedResource.authorId,
        reviewers: sharedResource.reviewers?.map(r => ({
           id: r.id,
           userId: r.userId,
           approvalStatus: r.approvalStatus
        }))
      }
    };
  }
}
