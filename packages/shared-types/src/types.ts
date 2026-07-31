export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  sizeBytes: number;
  uploadDate: string;
  downloadUrl: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  createdAt: string;
}

export interface Reviewer {
  id: string;
  userId: string;
  user: User;
  status: 'pending' | 'approved' | 'changes_requested';
  assignedAt: string;
}

export interface PullRequestVersion {
  id: string;
  versionNumber: number;
  createdAt: string;
  creatorId: string;
  creator: User;
}

export interface PullRequest {
  id: string;
  title: string;
  url: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'MERGED';
  requiredApprovals: number;
  currentApprovals: number;
  reviewers: Reviewer[];
  version: PullRequestVersion;
  sharingStatus: 'not_shared' | 'shared';
  mergeable: boolean;
  mergeReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceShare {
  id: string;
  resourceId: string;
  resourceType: 'ticket' | 'pull_request';
  ownerOrganizationId: string;
  targetOrganizationId: string;
  permissions: 'read' | 'write' | 'admin';
  revokedAt?: string;
  createdAt: string;
}

export interface Digest {
  id: string;
  organizationId: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Audit {
  id: string;
  action: string;
  actorId: string;
  targetId?: string;
  timestamp: string;
}
